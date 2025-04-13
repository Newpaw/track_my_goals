from datetime import date, datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship


class GoalType(str, Enum):
    """Goal type enumeration"""
    BINARY = "binary"
    QUANTITATIVE = "quantitative"


class GoalBase(SQLModel):
    """Base Goal model with shared attributes"""
    title: str
    description: Optional[str] = None
    target_date: date
    type: GoalType = Field(default=GoalType.BINARY)


class Goal(GoalBase, table=True):
    """Goal database model"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default=None)
    
    # Relationships
    user: "User" = Relationship(back_populates="goals")
    checkins: List["CheckIn"] = Relationship(back_populates="goal")


class GoalCreate(GoalBase):
    """Goal creation schema"""
    pass


class GoalRead(GoalBase):
    """Goal read schema"""
    id: UUID
    user_id: UUID


class GoalUpdate(SQLModel):
    """Goal update schema"""
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None
    type: Optional[GoalType] = None