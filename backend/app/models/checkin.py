from datetime import date, datetime
from typing import Optional, Union
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship
from pydantic import validator


class CheckInBase(SQLModel):
    """Base CheckIn model with shared attributes"""
    status: Union[bool, float]  # bool for binary goals, float for quantitative
    note: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v, values):
        """Validate status based on goal type"""
        # Note: This validation is better handled at the API level
        # where we have access to the goal type
        return v


class CheckIn(CheckInBase, table=True):
    """CheckIn database model"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    goal_id: UUID = Field(foreign_key="goal.id")
    date: date = Field(default=None)
    created_at: datetime = Field(default=None)
    
    # Relationships
    goal: "Goal" = Relationship(back_populates="checkins")


class CheckInCreate(CheckInBase):
    """CheckIn creation schema"""
    goal_id: UUID


class CheckInRead(CheckInBase):
    """CheckIn read schema"""
    id: UUID
    goal_id: UUID


class CheckInUpdate(SQLModel):
    """CheckIn update schema"""
    status: Optional[Union[bool, float]] = None
    note: Optional[str] = None