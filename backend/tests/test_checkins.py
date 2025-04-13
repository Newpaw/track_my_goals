import pytest
from fastapi import status
from datetime import date, timedelta


def test_create_checkin(client, test_auth_headers):
    """Test creating a check-in"""
    # Create a goal first
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    goal_response = client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    goal_id = goal_response.json()["id"]
    
    # Test data for check-in
    checkin_data = {
        "goal_id": goal_id,
        "date": str(date.today()),
        "status": True,
        "note": "Made good progress today",
    }
    
    # Create check-in
    response = client.post(
        "/api/v1/checkins",
        json=checkin_data,
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["goal_id"] == checkin_data["goal_id"]
    assert data["date"] == checkin_data["date"]
    assert data["status"] == checkin_data["status"]
    assert data["note"] == checkin_data["note"]
    assert "id" in data


def test_create_checkin_nonexistent_goal(client, test_auth_headers):
    """Test creating a check-in for a nonexistent goal"""
    # Test data for check-in
    checkin_data = {
        "goal_id": "00000000-0000-0000-0000-000000000000",
        "date": str(date.today()),
        "status": True,
        "note": "Made good progress today",
    }
    
    # Create check-in
    response = client.post(
        "/api/v1/checkins",
        json=checkin_data,
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Goal not found" in response.json()["detail"]


def test_create_duplicate_checkin(client, test_auth_headers):
    """Test creating a duplicate check-in"""
    # Create a goal first
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    goal_response = client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    goal_id = goal_response.json()["id"]
    
    # Test data for check-in
    checkin_data = {
        "goal_id": goal_id,
        "date": str(date.today()),
        "status": True,
        "note": "Made good progress today",
    }
    
    # Create first check-in
    client.post(
        "/api/v1/checkins",
        json=checkin_data,
        headers=test_auth_headers,
    )
    
    # Create duplicate check-in
    response = client.post(
        "/api/v1/checkins",
        json=checkin_data,
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Check-in for this date already exists" in response.json()["detail"]


def test_get_checkins(client, test_auth_headers):
    """Test getting all check-ins for a goal"""
    # Create a goal first
    goal_data = {
        "title": "Learn Python",
        "description": "Master Python programming language",
        "target_date": str(date.today() + timedelta(days=30)),
        "type": "binary",
    }
    
    goal_response = client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=test_auth_headers,
    )
    
    goal_id = goal_response.json()["id"]
    
    # Create a check-in
    checkin_data = {
        "goal_id": goal_id,
        "date": str(date.today()),
        "status": True,
        "note": "Made good progress today",
    }
    
    client.post(
        "/api/v1/checkins",
        json=checkin_data,
        headers=test_auth_headers,
    )
    
    # Get check-ins
    response = client.get(
        f"/api/v1/checkins/{goal_id}",
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["goal_id"] == goal_id
    assert data[0]["date"] == checkin_data["date"]
    assert data[0]["status"] == checkin_data["status"]
    assert data[0]["note"] == checkin_data["note"]


def test_get_checkins_nonexistent_goal(client, test_auth_headers):
    """Test getting check-ins for a nonexistent goal"""
    # Get check-ins
    response = client.get(
        "/api/v1/checkins/00000000-0000-0000-0000-000000000000",
        headers=test_auth_headers,
    )
    
    # Check response
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Goal not found" in response.json()["detail"]