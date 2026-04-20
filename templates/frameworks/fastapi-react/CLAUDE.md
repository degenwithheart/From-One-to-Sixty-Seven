# FastAPI + React Full-Stack Specific Rules

> Stack: FastAPI (Python) + React (TypeScript) + PostgreSQL + SQLAlchemy
> Variant: Modern async full-stack development

## Architecture

### Project Structure
```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── users.py
│   │   │   │   │   └── items.py
│   │   │   │   └── api.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   └── user.py
│   │   ├── services/
│   │   │   └── user_service.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

## Backend (FastAPI)

### Main Application
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    
    ASSUMPTIONS:
    - Database tables exist or auto-create in dev
    - Startup/shutdown hooks for connections
    """
    # Startup
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="API Service",
    description="FastAPI backend service",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
)

# CORS - NEVER use allow_origins=["*"] in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    max_age=600,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": "1.0.0"}
```

### Configuration
```python
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """
    Application configuration.
    
    SECURITY NOTE:
    - All secrets loaded from environment
    - No default values for sensitive config
    """
    APP_NAME: str = "FastAPI Service"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/app"
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    ).split(",")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.ENVIRONMENT == "production" and not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set in production")

settings = Settings()
```

### Models (SQLAlchemy)
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from app.db.base import Base
import re

class User(Base):
    """
    User model with validation and relationships.
    
    ASSUMPTIONS:
    - Email is unique and verified before creation
    - Password is hashed, never stored plain
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    items = relationship("Item", back_populates="owner", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_users_email_active', 'email', 'is_active'),
    )
    
    @validates('email')
    def validate_email(self, key, email):
        """Validate email format."""
        if not email:
            raise ValueError("Email is required")
        
        email = email.lower().strip()
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValueError("Invalid email format")
        
        return email
    
    @validates('full_name')
    def validate_full_name(self, key, name):
        """Validate name is not empty and reasonable length."""
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(name) > 255:
            raise ValueError("Name too long (max 255 characters)")
        return name.strip()
    
    def to_dict(self):
        """Convert to dictionary (never include password)."""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
```

### Schemas (Pydantic)
```python
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    
    @field_validator('full_name')
    @classmethod
    def validate_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

class UserCreate(UserBase):
    """Schema for user creation."""
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets security requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain digit")
        return v

class UserUpdate(BaseModel):
    """Schema for user updates (all optional)."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    password: Optional[str] = Field(None, min_length=8)

class UserInDB(UserBase):
    """Schema for user from database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserResponse(UserBase):
    """Schema for user response (no sensitive data)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    created_at: datetime
```

### API Endpoints
```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional

from app import schemas, models, services
from app.api import deps
from app.core.security import get_current_active_user

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.get("/users", response_model=List[schemas.UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    List users with pagination and filtering.
    
    ASSUMPTIONS:
    - Only superusers can see inactive users
    - Regular users only see active users
    """
    if not current_user.is_superuser:
        is_active = True
    
    users = services.user_service.get_users(
        db, skip=skip, limit=limit, is_active=is_active
    )
    return users

@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Create new user.
    
    SECURITY NOTE:
    - Check email uniqueness before creation
    - Hash password before storage
    - Log creation for audit
    """
    # Check if user exists
    existing = services.user_service.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = services.user_service.create(db, obj_in=user_in)
    
    # Audit log
    services.audit_service.log_action(
        db,
        action="user_created",
        user_id=current_user.id,
        target_id=user.id,
        details={"email": user.email}
    )
    
    return user

@router.get("/users/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: models.User = Depends(get_current_active_user)
):
    """Get current authenticated user info."""
    return current_user

@router.put("/users/me", response_model=schemas.UserResponse)
async def update_current_user(
    user_update: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update current user profile."""
    # If changing email, verify not taken
    if user_update.email and user_update.email != current_user.email:
        existing = services.user_service.get_by_email(db, email=user_update.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    updated_user = services.user_service.update(
        db, db_obj=current_user, obj_in=user_update
    )
    return updated_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Soft delete user.
    
    SECURITY NOTE:
    - Users can only delete themselves unless superuser
    - Soft delete preserves data integrity
    """
    user = services.user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    services.user_service.soft_delete(db, id=user_id)
    return None
```

### Services (Business Logic)
```python
from typing import Optional, List
from sqlalchemy.orm import Session
from app import models, schemas
from app.core.security import get_password_hash, verify_password

class UserService:
    """
    User business logic service.
    
    All database operations go through this service layer.
    """
    
    def get(self, db: Session, id: int) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == id).first()
    
    def get_by_email(self, db: Session, email: str) -> Optional[models.User]:
        return db.query(models.User).filter(
            models.User.email == email.lower()
        ).first()
    
    def get_users(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[models.User]:
        query = db.query(models.User)
        
        if is_active is not None:
            query = query.filter(models.User.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: schemas.UserCreate) -> models.User:
        """Create user with hashed password."""
        db_obj = models.User(
            email=obj_in.email.lower(),
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self,
        db: Session,
        db_obj: models.User,
        obj_in: schemas.UserUpdate | dict
    ) -> models.User:
        """Update user fields."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        # Hash password if updating
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(
                update_data.pop("password")
            )
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def soft_delete(self, db: Session, id: int) -> None:
        """Soft delete by setting is_active=False."""
        user = self.get(db, id)
        if user:
            user.is_active = False
            db.add(user)
            db.commit()
    
    def authenticate(
        self,
        db: Session,
        email: str,
        password: str
    ) -> Optional[models.User]:
        """Authenticate user credentials."""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

user_service = UserService()
```

## Frontend (React + TypeScript)

### API Client
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface ApiError {
  detail: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: 'An error occurred',
      }));
      throw new ApiError(response.status, error.detail, error.errors);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient(API_BASE_URL);
```

### React Hooks
```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  password: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  password?: string;
}

interface UsersResponse {
  items: User[];
  total: number;
}

export function useUsers(skip = 0, limit = 20) {
  return useQuery<UsersResponse>({
    queryKey: ['users', skip, limit],
    queryFn: () => api.get(`/users?skip=${skip}&limit=${limit}`),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) =>
      api.post<User>('/users', data),
    onSuccess: () => {
      // Invalidate users cache
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: (data) => {
      // Update cache for this specific user
      queryClient.setQueryData(['user', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Components
```tsx
// src/components/UserList.tsx
import React, { useState } from 'react';
import { useUsers, useDeleteUser } from '../hooks/useUsers';

export const UserList: React.FC = () => {
  const [page, setPage] = useState(0);
  const limit = 20;
  const skip = page * limit;

  const { data, isLoading, error } = useUsers(skip, limit);
  const deleteUser = useDeleteUser();

  if (isLoading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error" role="alert">
        Error loading users: {error.message}
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    /**
     * ASSUMPTIONS:
     * - User confirms before deletion
     * - Soft delete on backend
     */
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUser.mutateAsync(id);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="user-list">
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((user) => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>
                <span className={user.is_active ? 'active' : 'inactive'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deleteUser.isPending}
                  aria-label={`Delete ${user.full_name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={(data?.items.length || 0) < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

## Testing

### Backend Tests
```python
# backend/tests/test_users.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_user(client, db):
    """Test user creation endpoint."""
    response = client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "SecurePass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "password" not in data

def test_create_user_duplicate_email(client, db):
    """Test duplicate email rejection."""
    # Create first user
    client.post(
        "/api/v1/users",
        json={
            "email": "duplicate@example.com",
            "full_name": "First User",
            "password": "SecurePass123"
        }
    )
    
    # Try to create duplicate
    response = client.post(
        "/api/v1/users",
        json={
            "email": "duplicate@example.com",
            "full_name": "Second User",
            "password": "SecurePass123"
        }
    )
    assert response.status_code == 400

def test_password_validation(client):
    """Test password strength requirements."""
    response = client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "full_name": "Test",
            "password": "weak"
        }
    )
    assert response.status_code == 422
```

## Security Checklist

- [ ] SECRET_KEY strong and in environment
- [ ] Passwords hashed with bcrypt/argon2
- [ ] JWT tokens with expiration
- [ ] CORS origins explicitly whitelisted
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection prevention (SQLAlchemy ORM)
- [ ] Input validation on all endpoints
- [ ] Audit logging for sensitive operations
- [ ] HTTPS in production
- [ ] Security headers (CSP, HSTS, etc.)

## SUMMARY

FastAPI + React stack:
1. Use SQLAlchemy models with validation
2. Separate business logic into services
3. Pydantic schemas for all API I/O
4. React Query for server state management
5. TypeScript types shared between frontend/backend
6. Async/await throughout for performance
7. Security at every layer (auth, validation, headers)
