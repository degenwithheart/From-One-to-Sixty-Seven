# Django REST Framework Specific Rules

> Stack: Django + Django REST Framework + PostgreSQL
> Variant: Full-Stack API Development

## Architecture

### Project Structure
```
project/
├── apps/
│   ├── users/              # User management
│   ├── core/               # Shared utilities
│   └── api/                # API versioning
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── docker-compose.yml
└── manage.py
```

### App Design
- **Single Responsibility**: One app per domain (users, orders, products)
- **Thin Views, Fat Models**: Business logic in models/managers
- **DRY**: Use mixins for shared serializer/view behavior
- **API Versioning**: `/api/v1/`, `/api/v2/` in URL path

## Models

### Requirements
```python
from django.db import models
from django.core.validators import MinValueValidator

class Product(models.Model):
    """
    Product model with full validation.
    
    ASSUMPTIONS:
    - SKU is unique across all products
    - Price is stored in cents to avoid float issues
    """
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    price_cents = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'created_at']),
        ]
    
    def clean(self):
        """Validate model before save."""
        if self.sku and not self.sku.isalnum():
            raise ValidationError("SKU must be alphanumeric")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
```

### Best Practices
- Always define `Meta` class with indexes for query optimization
- Use `db_index=True` on fields used in filtering
- Implement `clean()` for complex validation
- Use `select_related` and `prefetch_related` appropriately
- Never use `null=True` on CharField/TextField (use `default=''`)

## Serializers

### Requirements
```python
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    """
    Product serializer with computed fields.
    
    SECURITY NOTE:
    - Never expose internal IDs to clients
    - Always validate user permissions in to_representation
    """
    price = serializers.SerializerMethodField()
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    
    class Meta:
        model = Product
        fields = ['id', 'sku', 'name', 'price', 'category_name', 'is_active']
        read_only_fields = ['id']
    
    def get_price(self, obj: Product) -> str:
        """Return formatted price."""
        return f"${obj.price_cents / 100:.2f}"
    
    def validate_sku(self, value: str) -> str:
        """Validate SKU format."""
        if not value.isalnum():
            raise serializers.ValidationError(
                "SKU must be alphanumeric"
            )
        return value.upper()
    
    def create(self, validated_data: dict) -> Product:
        """Create with audit logging."""
        product = super().create(validated_data)
        # Log creation for audit trail
        AuditLog.objects.create(
            action='product_created',
            object_id=product.id,
            user=self.context['request'].user
        )
        return product
```

### Validation Rules
- Always use `validate_<field>` methods for field-level validation
- Use `validate()` for object-level validation
- Never trust client input - re-validate in `create()`/`update()`
- Include `read_only_fields` explicitly

## Views

### Requirements
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer
from .filters import ProductFilter
from .permissions import IsOwnerOrReadOnly

class ProductViewSet(viewsets.ModelViewSet):
    """
    Product API with filtering, pagination, and permissions.
    
    ASSUMPTIONS:
    - Authenticated users can read
    - Only owners can modify
    - Soft delete via is_active flag
    """
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(owner=self.request.user)
        
        return queryset.select_related('category').prefetch_related('tags')
    
    def perform_create(self, serializer):
        """Set owner on creation."""
        serializer.save(owner=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete instead of hard delete."""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Custom action to duplicate a product."""
        product = self.get_object()
        new_product = Product.objects.create(
            sku=f"{product.sku}-COPY",
            name=f"Copy of {product.name}",
            price_cents=product.price_cents,
            owner=request.user
        )
        serializer = self.get_serializer(new_product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### Best Practices
- Always use `get_queryset()` instead of class-level `queryset` when filtering by user
- Use `select_related` for ForeignKey, `prefetch_related` for ManyToMany
- Implement soft delete for data integrity
- Use `@action` for custom endpoints

## Permissions

```python
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner
        return obj.owner == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """Only admins can modify, anyone can read."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
```

## URL Configuration

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views import ProductViewSet
from apps.users.views import UserViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
```

## Testing

```python
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models import Product

@pytest.mark.django_db
class TestProductAPI:
    """
    Product API integration tests.
    
    ASSUMPTIONS:
    - Test database is isolated per test
    - Fixtures provide test data
    """
    
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_list_products(self):
        """Test retrieving product list."""
        Product.objects.create(
            sku='TEST001',
            name='Test Product',
            price_cents=1000,
            owner=self.user
        )
        
        response = self.client.get('/api/v1/products/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_create_product(self):
        """Test product creation with valid data."""
        data = {
            'sku': 'NEW001',
            'name': 'New Product',
            'price_cents': 2500
        }
        
        response = self.client.post('/api/v1/products/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Product.objects.filter(sku='NEW001').exists()
    
    def test_create_product_invalid_sku(self):
        """Test validation rejects invalid SKU."""
        data = {
            'sku': 'invalid-sku!',
            'name': 'Invalid',
            'price_cents': 1000
        }
        
        response = self.client.post('/api/v1/products/', data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'sku' in response.data
    
    def test_cannot_delete_other_users_product(self):
        """Test users cannot delete others' products."""
        other_user = User.objects.create_user(
            username='other',
            password='pass123'
        )
        product = Product.objects.create(
            sku='OTHER001',
            name='Other Product',
            price_cents=1000,
            owner=other_user
        )
        
        response = self.client.delete(f'/api/v1/products/{product.id}/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
```

## Settings

```python
# config/settings/base.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_filters',
    'corsheaders',
    'apps.users',
    'apps.products',
    'apps.core',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 
        'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    },
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
        'CONN_MAX_AGE': 600,
    }
}

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

## Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/prod.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "config.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: django_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
      - DB_HOST=db
    depends_on:
      - db

volumes:
  postgres_data:
```

## Security Checklist

- [ ] SECRET_KEY stored in environment variable, never committed
- [ ] DEBUG=False in production
- [ ] Allowed hosts explicitly configured
- [ ] CORS properly configured (never `CORS_ALLOW_ALL_ORIGINS = True` in prod)
- [ ] SQL injection prevention via ORM (no raw SQL with user input)
- [ ] XSS prevention via Django templates/auto-escaping
- [ ] CSRF tokens on all state-changing requests
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Input validation on all API endpoints
- [ ] Audit logging for sensitive operations
- [ ] Password validation (not just length check)

## SUMMARY

When working with Django REST Framework:
1. Keep business logic in models, use views as thin controllers
2. Always validate at serializer level AND model level
3. Use proper permission classes for every endpoint
4. Implement soft deletes for data integrity
5. Write comprehensive tests covering auth, validation, and edge cases
6. Follow security checklist for production deployments
7. Use PostgreSQL-specific features (indexes, JSONField, ArrayField)
8. Optimize queries with select_related/prefetch_related
