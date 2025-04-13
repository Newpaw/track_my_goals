from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.api.deps import authenticate_user
from app.core.errors import BadRequestError
from app.core.security import create_access_token, get_password_hash
from app.database import get_session
from app.models.user import User, UserCreate, UserRead, Token
from app.config import settings

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    session: Session = Depends(get_session),
) -> User:
    """
    Register a new user
    
    Args:
        user_in: User creation data
        session: Database session
        
    Returns:
        Created user
        
    Raises:
        BadRequestError: If user with this email already exists
    """
    # Check if user with this email already exists
    existing_user = session.exec(
        select(User).where(User.email == user_in.email)
    ).first()
    
    if existing_user:
        raise BadRequestError(detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        created_at=datetime.utcnow(),
    )
    
    # Add user to database
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
) -> dict:
    """
    OAuth2 compatible token login, get an access token for future requests
    
    Args:
        form_data: OAuth2 form data
        session: Database session
        
    Returns:
        Access token
        
    Raises:
        HTTPException: If authentication fails
    """
    # Authenticate user
    user = authenticate_user(form_data.username, form_data.password, session)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }