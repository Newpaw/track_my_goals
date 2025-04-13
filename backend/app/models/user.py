from datetime import datetime
from typing import Optional, List, Annotated
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.database import Base

# SQLAlchemy Models

class User(Base):
    """User database model"""
    __tablename__ = "user"
    
    id: Mapped[UUID] = mapped_column(PGUUID, primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    
    # Relationships
    goals: Mapped[List["Goal"]] = relationship("Goal", back_populates="user", cascade="all, delete-orphan")

# Pydantic Models

class UserBase(BaseModel):
    """Base User model with shared attributes"""
    email: EmailStr
    created_at: Optional[datetime] = None  # Will be set in API layer
    
    class Config:
        from_attributes = True

class UserCreate(UserBase):
    """User creation schema"""
    password: str

class UserRead(UserBase):
    """User read schema"""
    id: UUID

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Token schema"""
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """Token payload schema"""
    sub: Optional[str] = None