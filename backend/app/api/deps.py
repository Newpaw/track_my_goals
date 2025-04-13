from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlmodel import Session, select
from typing import Generator, Optional

from app.core.errors import AuthenticationError
from app.core.security import verify_password
from app.database import get_session
from app.models.user import User, TokenPayload
from app.config import settings

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    session: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Get the current authenticated user
    
    Args:
        session: Database session
        token: JWT token
        
    Returns:
        User: Current authenticated user
        
    Raises:
        AuthenticationError: If authentication fails
    """
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise AuthenticationError()
    
    # Get user from database
    user = session.exec(
        select(User).where(User.id == token_data.sub)
    ).first()
    
    if not user:
        raise AuthenticationError()
    
    return user


def authenticate_user(
    email: str, 
    password: str, 
    session: Session
) -> Optional[User]:
    """
    Authenticate a user with email and password
    
    Args:
        email: User email
        password: User password
        session: Database session
        
    Returns:
        User if authentication succeeds, None otherwise
    """
    # Get user from database
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user