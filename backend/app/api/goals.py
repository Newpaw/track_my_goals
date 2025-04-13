from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from app.api.deps import get_current_user
from app.core.errors import NotFoundError, AuthorizationError
from app.database import get_session
from app.models.goal import Goal, GoalCreate, GoalRead, GoalUpdate
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[GoalRead])
def get_goals(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> List[Goal]:
    """
    Get all goals for the current user
    
    Args:
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        List of goals
    """
    goals = session.exec(
        select(Goal).where(Goal.user_id == current_user.id)
    ).all()
    
    return goals


@router.post("", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Goal:
    """
    Create a new goal for the current user
    
    Args:
        goal_in: Goal creation data
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        Created goal
    """
    # Create new goal
    goal_data = goal_in.dict()
    goal = Goal(
        **goal_data,
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    
    # Add goal to database
    session.add(goal)
    session.commit()
    session.refresh(goal)
    
    return goal


@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(
    goal_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Goal:
    """
    Get a specific goal by ID
    
    Args:
        goal_id: Goal ID
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        Goal
        
    Raises:
        NotFoundError: If goal not found
        AuthorizationError: If goal doesn't belong to current user
    """
    # Get goal from database
    goal = session.exec(
        select(Goal).where(Goal.id == goal_id)
    ).first()
    
    # Check if goal exists
    if not goal:
        raise NotFoundError(detail="Goal not found")
    
    # Check if goal belongs to current user
    if goal.user_id != current_user.id:
        raise AuthorizationError(detail="Not authorized to access this goal")
    
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a goal
    
    Args:
        goal_id: Goal ID
        session: Database session
        current_user: Current authenticated user
        
    Raises:
        NotFoundError: If goal not found
        AuthorizationError: If goal doesn't belong to current user
    """
    # Get goal from database
    goal = session.exec(
        select(Goal).where(Goal.id == goal_id)
    ).first()
    
    # Check if goal exists
    if not goal:
        raise NotFoundError(detail="Goal not found")
    
    # Check if goal belongs to current user
    if goal.user_id != current_user.id:
        raise AuthorizationError(detail="Not authorized to delete this goal")
    
    # Delete goal
    session.delete(goal)
    session.commit()