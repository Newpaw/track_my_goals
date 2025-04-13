import pytest
from fastapi import status
from datetime import date, timedelta


def test_create_goal(client, test_auth_headers):
    """Test creating a goal"""
    # Test data
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    # Create goal
    response = client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == goal_data["title"]
    assert data["description"] == goal_data["description"]
    assert data["target_date"] == goal_data["target_date"]
    assert data["type"] == goal_data["type"]
    assert "id" in data
    assert "user_id" in data


def test_get_goals(client, test_auth_headers):
    """Test getting all goals"""
    # Create a goal first
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    # Get goals
    response = client.get(
        "/api/v1/goals",
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == goal_data["title"]


def test_get_goal(client, test_auth_headers):
    """Test getting a specific goal"""
    # Create a goal first
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    create_response = client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    goal_id = create_response.json()["id"]
    
    # Get goal
    response = client.get(
        f"/api/v1/goals/{goal_id}",
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == goal_id
    assert data["title"] == goal_data["title"]


def test_get_nonexistent_goal(client, test_auth_headers):
    """Test getting a nonexistent goal"""
    # Get goal with nonexistent ID
    response = client.get(
        "/api/v1/goals/00000000-0000-0000-0000-000000000000",
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Goal not found" in response.json()["detail"]


def test_delete_goal(client, test_auth_headers):
    """Test deleting a goal"""
    # Create a goal first
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    create_response = client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    goal_id = create_response.json()["id"]
    
    # Delete goal
    response = client.delete(
        f"/api/v1/goals/{goal_id}",
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify goal is deleted
    get_response = client.get(
        f"/api/v1/goals/{goal_id}",
        headers=test_auth_headers,
    )
    
    assert get_response.status_code == status.HTTP_404_NOT_FOUND