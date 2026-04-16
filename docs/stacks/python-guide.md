# Python Guide: Deep Dive

Comprehensive guide for using From One to Sixty-Seven with Python projects.

---

## Python-Specific Rules

### Type Hints

**Required:** All function signatures must have type hints.

**Compliant:**
```python
def calculate_discount(order_total: Decimal, customer_tier: str) -> Decimal:
    """Calculate discount based on order total and customer tier."""
    ...

async def fetch_user(user_id: UUID) -> User | None:
    """Fetch user by ID. Returns None if not found."""
    ...
```

**Violation:**
```python
def calculate_discount(order_total, customer_tier):
    """No type hints."""
    ...
```

**Advanced typing:**
```python
from typing import TypeVar, Generic, Protocol
from collections.abc import Iterator

T = TypeVar('T')

class Repository(Generic[T]):
    def get(self, id: UUID) -> T | None: ...
    def list(self) -> Iterator[T]: ...

# Protocol for structural typing
class Drawable(Protocol):
    def draw(self) -> None: ...
```

### Async/Await

**Rule:** Use async for I/O operations, sync for CPU-bound.

**Compliant:**
```python
# Async for I/O
async def fetch_user(user_id: UUID) -> User:
    async with db.session() as session:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

# Sync for CPU-bound
def calculate_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
```

**Violation:**
```python
# Blocking I/O in async function
async def fetch_user(user_id: UUID) -> User:
    return requests.get(f"/users/{user_id}")  # Blocking!
```

**Fix:**
```python
import httpx

async def fetch_user(user_id: UUID) -> User:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"/users/{user_id}")
        return response.json()
```

### Error Handling

**Rule:** Explicit exception handling, no bare except.

**Compliant:**
```python
def process_payment(user_id: UUID, amount: Decimal) -> PaymentResult:
    try:
        user = get_user(user_id)
        if not user:
            raise UserNotFoundError(user_id)
        
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency="usd",
            customer=user.stripe_id
        )
        return PaymentResult.success(charge.id)
        
    except stripe.error.CardError as e:
        logger.warning(f"Card declined: {e}")
        return PaymentResult.failed(str(e))
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise PaymentGatewayError from e
```

**Violation:**
```python
def process_payment(user_id, amount):
    try:
        user = get_user(user_id)
        charge = stripe.Charge.create(...)
        return charge
    except:  # Bare except - catches everything including KeyboardInterrupt
        return None
```

### Package Management

**Rule:** Pin dependencies with hashes in production.

**Compliant (requirements.txt):**
```
# requirements.txt
fastapi==0.104.1 \
    --hash=sha256:7520a65939e42deee3e62e06dc65d33362d6c11e\</strong>...
sqlalchemy==2.0.23 \
    --hash=sha256:f1f5c3e7b75e9f567a3...<strong>
```

**pyproject.toml:**
```toml
[project]
dependencies = [
    "fastapi>=0.104.0",
    "sqlalchemy>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "mypy>=1.0.0",
]
```

**Violation:**
```
# No version pinning
fastapi
sqlalchemy
```

### Imports

**Rule:** Organize imports: stdlib, third-party, local.

**Compliant:**
```python
# Standard library
import json
from datetime import datetime, timezone
from typing import Any

# Third-party
import httpx
from fastapi import FastAPI, HTTPException
from sqlalchemy import select

# Local
from myapp.models import User
from myapp.services import AuthService
from myapp.utils import format_datetime
```

**Tool:** Use `isort` or `ruff` to enforce:
```toml
[tool.isort]
profile = "black"
src_paths = ["src", "tests"]
known_first_party = ["myapp"]
```

### Logging

**Rule:** Use standard logging, no print statements.

**Compliant:**
```python
import logging
import structlog

logger = structlog.get_logger()

def process_order(order_id: UUID) -> None:
    logger.info(
        "processing_order",
        order_id=str(order_id),
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    
    try:
        order = fetch_order(order_id)
        process_payment(order)
        logger.info("order_processed", order_id=str(order_id))
    except PaymentError as e:
        logger.error(
            "payment_failed",
            order_id=str(order_id),
            error=str(e),
            exc_info=True
        )
        raise
```

**Violation:**
```python
def process_order(order_id):
    print(f"Processing order {order_id}")  # No!
    ...
```

---

## Python Project Structure

### Recommended Layout

```
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── main.py           # Application entry point
│       ├── api/              # API layer
│       │   ├── __init__.py
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── dependencies/
│       ├── models/           # Database models
│       │   ├── __init__.py
│       │   ├── user.py
│       │   └── order.py
│       ├── services/         # Business logic
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   └── payment.py
│       ├── repositories/     # Data access
│       │   ├── __init__.py
│       │   └── base.py
│       └── utils/            # Utilities
│           ├── __init__.py
│           └── helpers.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── docs/
├── pyproject.toml
├── requirements.txt
└── README.md
```

### Key Files

**pyproject.toml:**
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "myproject"
version = "0.1.0"
description = "My project"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "sqlalchemy>=2.0.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]

[tool.black]
line-length = 88
target-version = ['py311']

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W", "UP", "B", "C4", "SIM"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
```

---

## Testing with Python

### Test Structure

**Compliant:**
```python
# tests/test_payment.py
import pytest
from decimal import Decimal
from uuid import uuid4

from myproject.services.payment import process_payment
from myproject.models import User


class TestProcessPayment:
    """Test payment processing service."""
    
    def test_successful_payment(self, mock_stripe):
        """Happy path: payment succeeds."""
        # Arrange
        user = User(id=uuid4(), stripe_id="cus_123")
        amount = Decimal("100.00")
        
        # Act
        result = process_payment(user.id, amount)
        
        # Assert
        assert result.status == "success"
        assert result.charge_id is not None
    
    def test_insufficient_funds(self, mock_stripe):
        """Error path: card declined."""
        mock_stripe.Charge.create.side_effect = CardError("Insufficient funds")
        
        user = User(id=uuid4(), stripe_id="cus_123")
        amount = Decimal("100.00")
        
        result = process_payment(user.id, amount)
        
        assert result.status == "failed"
        assert "Insufficient funds" in result.error
    
    def test_invalid_amount(self):
        """Edge case: negative amount."""
        with pytest.raises(ValueError, match="Amount must be positive"):
            process_payment(uuid4(), Decimal("-10.00"))
    
    def test_user_not_found(self):
        """Edge case: user doesn't exist."""
        with pytest.raises(UserNotFoundError):
            process_payment(uuid4(), Decimal("100.00"))
```

### Fixtures

**conftest.py:**
```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from myproject.models import Base


@pytest.fixture
def db_session():
    """Create test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()


@pytest.fixture
def mock_stripe(mocker):
    """Mock Stripe API."""
    return mocker.patch("myproject.services.payment.stripe")


@pytest.fixture
def sample_user(db_session):
    """Create sample user."""
    from myproject.models import User
    
    user = User(email="test@example.com", stripe_id="cus_123")
    db_session.add(user)
    db_session.commit()
    
    return user
```

### Async Testing

```python
# tests/test_async.py
import pytest
import pytest_asyncio


@pytest_asyncio.fixture
async def async_client():
    """Async test client."""
    from httpx import AsyncClient
    from myproject.main import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
async def test_fetch_user(async_client):
    """Test async user fetching."""
    response = await async_client.get("/users/123")
    
    assert response.status_code == 200
    assert response.json()["id"] == "123"
```

---

## FastAPI Integration

### Application Setup

```python
# src/myproject/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from myproject.api.routes import auth, users, orders
from myproject.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="My Project",
    version="0.1.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
```

### Route Example

```python
# src/myproject/api/routes/users.py
from uuid import UUID
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from myproject.api.dependencies import get_db, get_current_user
from myproject.models import User
from myproject.schemas import UserCreate, UserResponse
from myproject.services import UserService

router = APIRouter()


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """Create new user."""
    service = UserService(db)
    
    # Check if email exists
    existing = await service.get_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = await service.create(data)
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Get current user info."""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """Get user by ID."""
    service = UserService(db)
    user = await service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
```

### Pydantic Schemas

```python
# src/myproject/schemas.py
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    """Schema for creating users."""
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    """Schema for user responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    is_active: bool
```

---

## SQLAlchemy Integration

### Model Definition

```python
# src/myproject/models/user.py
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from myproject.db.base import Base


class User(Base):
    """User model."""
    
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    full_name: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
```

### Repository Pattern

```python
# src/myproject/repositories/base.py
from typing import Generic, TypeVar, Type
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Base repository with common operations."""
    
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model
    
    async def get_by_id(self, id: UUID) -> T | None:
        """Get entity by ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, **kwargs) -> T:
        """Create new entity."""
        entity = self.model(**kwargs)
        self.session.add(entity)
        await self.session.flush()
        return entity
```

---

## Common Python Patterns

### Dependency Injection

```python
# FastAPI dependency
from typing import Annotated
from fastapi import Depends

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Database session dependency."""
    async with async_session() as session:
        yield session

async def get_user_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> UserService:
    """User service dependency."""
    return UserService(db)

# Usage in route
@router.get("/users")
async def list_users(
    service: Annotated[UserService, Depends(get_user_service)]
):
    return await service.list_users()
```

### Context Managers

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def transaction(session: AsyncSession):
    """Transaction context manager."""
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise


# Usage
async with transaction(db_session) as tx:
    user = await create_user(tx, data)
    await create_audit_log(tx, "user_created", user.id)
```

### Dataclasses for Value Objects

```python
from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class Money:
    """Immutable money value object."""
    amount: Decimal
    currency: str
    
    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Amount cannot be negative")
        if len(self.currency) != 3:
            raise ValueError("Currency must be 3-letter code")
    
    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)
```

---

## Verification Checklist

For Python projects:

- [ ] Type hints on all functions
- [ ] No bare except clauses
- [ ] Async used for I/O operations
- [ ] Imports organized (stdlib, third-party, local)
- [ ] Logging not print statements
- [ ] Tests for happy path, edge cases, errors
- [ ] Dependencies pinned with hashes
- [ ] Ruff/black/mypy passing
- [ ] No SQL injection vulnerabilities
- [ ] No hardcoded secrets

---

## See Also

- [stacks/python.md](../../stacks/python.md)
- [Getting Started](../getting-started.md)
- [Examples](../examples.md)
