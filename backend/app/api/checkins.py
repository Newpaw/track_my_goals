from datetime import date, datetime
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from app.api.deps import get_current_user
from app.core.errors import NotFoundError, AuthorizationError, BadRequestError
from app.database import get_session
from app.models.checkin import CheckIn, CheckInCreate, CheckInRead
from app.models.goal import Goal
from app.models.user import User

router = APIRouter()


@router.post("", response_model=CheckInRead, status_code=status.HTTP_201_CREATED)
def create_checkin(
    checkin_in: CheckInCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CheckIn:
    """
    Create a new check-in
    
    Args:
        checkin_in: Check-in creation data
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        Created check-in
        
    Raises:
        NotFoundError: If goal not found
        AuthorizationError: If goal doesn't belong to current user
        BadRequestError: If check-in for this date already exists
    """
    # Get goal from database
    goal = session.exec(
        select(Goal).where(Goal.id == checkin_in.goal_id)
    ).first()
    
    # Check if goal exists
    if not goal:
        raise NotFoundError(detail="Goal not found")
    
    # Check if goal belongs to current user
    if goal.user_id != current_user.id:
        raise AuthorizationError(detail="Not authorized to access this goal")
    
    # Check if check-in for this date already exists
    existing_checkin = session.exec(
        select(CheckIn).where(
            (CheckIn.goal_id == checkin_in.goal_id) & 
            (CheckIn.date == checkin_in.date)
        )
    ).first()
    
    if existing_checkin:
        raise BadRequestError(detail="Check-in for this date already exists")
    
    # Create new check-in
    checkin_data = checkin_in.dict()
    
    # Ensure date is set
    if not checkin_data.get('date'):
        checkin_data['date'] = date.today()
        
    checkin = CheckIn(
        **checkin_data,
        created_at=datetime.utcnow()
    )
    
    # Add check-in to database
    session.add(checkin)
    session.commit()
    session.refresh(checkin)
    
    return checkin


@router.get("/{goal_id}", response_model=List[CheckInRead])
def get_checkins(
    goal_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> List[CheckIn]:
    """
    Get all check-ins for a specific goal
    
    Args:
        goal_id: Goal ID
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        List of check-ins
        
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
    
    # Get check-ins from database
    checkins = session.exec(
        select(CheckIn)
        .where(CheckIn.goal_id == goal_id)
        .order_by(CheckIn.date.desc())
    ).all()
    
    return checkins