# Track My Goals - Backend API

This is the backend API for the Track My Goals application, built with FastAPI and SQLModel.

## Features

- User authentication with JWT tokens
- Goal management (create, read, delete)
- Daily check-ins for goal progress tracking
- SQLite database for development (can be switched to PostgreSQL for production)
- API documentation with Swagger UI

## Getting Started

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and adjust settings if needed:

```bash
cp .env.example .env
```

### Running the API

#### Development mode

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

API documentation will be available at:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

#### Using Docker

```bash
docker-compose up
```

### API Endpoints

| Method | Endpoint               | Description                            | Auth Required |
|--------|------------------------|----------------------------------------|---------------|
| POST   | `/api/v1/auth/register` | Register a new user                    | ❌             |
| POST   | `/api/v1/auth/login`    | Login and get JWT                      | ❌             |
| GET    | `/api/v1/goals`         | Get all goals for current user         | ✅             |
| POST   | `/api/v1/goals`         | Create a new goal                      | ✅             |
| GET    | `/api/v1/goals/{goal_id}` | Get detail of a single goal          | ✅             |
| DELETE | `/api/v1/goals/{goal_id}` | Delete a goal                        | ✅             |
| POST   | `/api/v1/checkins`      | Create a new daily check-in            | ✅             |
| GET    | `/api/v1/checkins/{goal_id}` | Get all check-ins for a specific goal | ✅         |

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration settings
│   ├── database.py             # Database connection and session management
│   ├── models/                 # SQLModel data models
│   │   ├── __init__.py
│   │   ├── user.py             # User model
│   │   ├── goal.py             # Goal model
│   │   └── checkin.py          # CheckIn model
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection
│   │   ├── auth.py             # Authentication routes
│   │   ├── goals.py            # Goal management routes
│   │   └── checkins.py         # Check-in routes
│   └── core/                   # Core functionality
│       ├── __init__.py
│       ├── security.py         # Password hashing, JWT
│       └── errors.py           # Error handling
├── tests/                      # Unit and integration tests
├── .env                        # Environment variables
├── .env.example                # Example environment variables
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
└── docker-compose.yml          # Docker Compose for local development