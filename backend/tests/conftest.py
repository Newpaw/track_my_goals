import os
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import User
from app.core.security import get_password_hash


@pytest.fixture(name="client")
def client_fixture():
    """
    Create a test client for FastAPI
    """
    # Use in-memory SQLite database for testing
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create tables
    SQLModel.metadata.create_all(test_engine)
    
    # Override get_session dependency
    def get_test_session():
        with Session(test_engine) as session:
            yield session
    
    app.dependency_overrides[get_session] = get_test_session
    
    # Create test client
    client = TestClient(app)
    
    # Clean up after test
    yield client
    
    # Remove tables
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(name="test_user")
def test_user_fixture(client):
    """
    Create a test user
    """
    # Create test user
    user_data = {
        "email": "test@example.com",
        "password": "password123",
    }
    
    # Register user
    response = client.post("/api/v1/auth/register", json=user_data)
    
    # Return user data
    return response.json()


@pytest.fixture(name="test_auth_headers")
def test_auth_headers_fixture(client):
    """
    Create authentication headers for test user
    """
    # Create test user
    user_data = {
        "email": "test@example.com",
        "password": "password123",
    }
    
    # Register user
    client.post("/api/v1/auth/register", json=user_data)
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": user_data["email"],
            "password": user_data["password"],
        },
    )
    
    # Get token
    token = response.json()["access_token"]
    
    # Return headers
    return {"Authorization": f"Bearer {token}"}