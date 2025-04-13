import pytest
from fastapi import status


def test_register_user(client):
    """Test user registration"""
    # Test data
    user_data = {
        "email": "newuser@example.com",
        "password": "password123",
    }
    
    # Register user
    response = client.post("/api/v1/auth/register", json=user_data)
    
    # Check response
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data
    assert "hashed_password" not in data


def test_register_existing_user(client, test_user):
    """Test registering an existing user"""
    # Test data
    user_data = {
        "email": "test@example.com",  # Same as test_user
        "password": "password123",
    }
    
    # Register user
    response = client.post("/api/v1/auth/register", json=user_data)
    
    # Check response
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]


def test_login_user(client, test_user):
    """Test user login"""
    # Login data
    login_data = {
        "username": "test@example.com",
        "password": "password123",
    }
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data=login_data,  # Use form data for OAuth2
    )
    
    # Check response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    """Test login with wrong password"""
    # Login data
    login_data = {
        "username": "test@example.com",
        "password": "wrongpassword",
    }
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data=login_data,  # Use form data for OAuth2
    )
    
    # Check response
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    """Test login with nonexistent user"""
    # Login data
    login_data = {
        "username": "nonexistent@example.com",
        "password": "password123",
    }
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data=login_data,  # Use form data for OAuth2
    )
    
    # Check response
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]