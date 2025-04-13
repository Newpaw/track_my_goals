from fastapi import HTTPException, status
from typing import Any, Dict, Optional


class NotFoundError(HTTPException):
    """Resource not found error"""
    
    def __init__(
        self, 
        detail: str = "Resource not found", 
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers=headers,
        )


class AuthenticationError(HTTPException):
    """Authentication error"""
    
    def __init__(
        self, 
        detail: str = "Could not validate credentials", 
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(HTTPException):
    """Authorization error"""
    
    def __init__(
        self, 
        detail: str = "Not enough permissions", 
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            headers=headers,
        )


class BadRequestError(HTTPException):
    """Bad request error"""
    
    def __init__(
        self, 
        detail: str = "Bad request", 
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
        )


class ConflictError(HTTPException):
    """Conflict error"""
    
    def __init__(
        self, 
        detail: str = "Resource conflict", 
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            headers=headers,
        )