# Track My Goals

A mobile application for tracking personal goals and habits with offline functionality and progress visualization.

## Project Overview

Track My Goals is a comprehensive goal tracking application that helps users set, track, and achieve their personal goals. The application consists of a FastAPI backend and a React Native/Expo mobile frontend.

### Key Features

- **User Authentication**: Secure registration and login system
- **Goal Management**: Create, view, update, and delete personal goals
- **Check-in System**: Regular check-ins to track progress toward goals
- **Progress Visualization**: Visual representation of goal progress over time
- **Offline Functionality**: Full offline support with data synchronization
- **Notifications**: Daily reminders for check-ins

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- pip (Python package manager)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on `.env.example` and configure your environment variables.

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app on your mobile device to scan the QR code, or press 'a' to open in an Android emulator or 'i' for iOS simulator.

## Usage Guide

### User Registration and Login

1. Open the app and navigate to the registration screen
2. Create an account with your email, username, and password
3. Log in with your credentials

### Goal Management

1. From the main screen, tap the "+" button to create a new goal
2. Fill in the goal details:
   - Title
   - Description
   - Category
   - Frequency (daily, weekly, monthly)
   - Target date
3. View your goals on the main screen
4. Tap on a goal to view details, edit, or delete it

### Check-ins

1. From the goal details screen, tap "Check In" to record your progress
2. Mark whether you completed your goal for the day
3. Add optional notes about your progress
4. View your check-in history and statistics

### Offline Usage

1. The app works fully offline - create goals and check-ins without an internet connection
2. When you regain connectivity, the app will automatically synchronize with the server
3. You can also manually sync by tapping "Sync Data" in the profile screen

### Notifications

1. Enable notifications in the profile screen
2. Set your preferred reminder time
3. Receive daily reminders to check in on your goals

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and receive JWT token
- `GET /api/v1/auth/me` - Get current user profile

### Goals Endpoints

- `GET /api/v1/goals` - Get all goals for the current user
- `GET /api/v1/goals/{goal_id}` - Get a specific goal by ID
- `POST /api/v1/goals` - Create a new goal
- `PUT /api/v1/goals/{goal_id}` - Update an existing goal
- `DELETE /api/v1/goals/{goal_id}` - Delete a goal

### Check-ins Endpoints

- `POST /api/v1/checkins` - Create a new check-in
- `GET /api/v1/checkins/{goal_id}` - Get all check-ins for a specific goal
- `GET /api/v1/checkins/{goal_id}/stats` - Get check-in statistics for a goal
- `PUT /api/v1/checkins/{checkin_id}` - Update an existing check-in

## Development Workflow

### Backend Development

1. Make changes to the backend code
2. Run tests to ensure functionality:
   ```bash
   cd backend
   pytest
   ```
3. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Development

1. Make changes to the frontend code
2. Test changes using the Expo development server:
   ```bash
   cd mobile
   npm start
   ```

### Integration Testing

1. Ensure both backend and frontend are running
2. Test the integration between frontend and backend
3. Verify that all API endpoints are correctly called from the frontend
4. Test offline functionality by disconnecting from the network
5. Test data synchronization when reconnecting

### Troubleshooting

If you encounter issues with the backend server:

1. Check that you're using compatible versions of SQLModel and Pydantic
2. Ensure your database migrations are up to date
3. Check the console for error messages

For frontend issues:

1. Clear the Expo cache: `expo r -c`
2. Ensure all dependencies are installed: `npm install`
3. Check that the API_URL in `mobile/src/api/index.js` points to your backend server

## Project Structure

### Backend Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core functionality
│   ├── models/        # Database models
│   ├── services/      # Business logic
│   ├── config.py      # Configuration
│   ├── database.py    # Database setup
│   └── main.py        # Application entry point
├── tests/             # Test cases
├── .env               # Environment variables
├── .env.example       # Example environment variables
├── requirements.txt   # Python dependencies
└── docker-compose.yml # Docker configuration
```

### Frontend Structure

```
mobile/
├── assets/            # Static assets
├── src/
│   ├── api/           # API client
│   ├── components/    # Reusable components
│   ├── constants/     # Constants and configuration
│   ├── hooks/         # Custom React hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Application screens
│   ├── store/         # State management
│   └── utils/         # Utility functions
├── App.js             # Application entry point
└── package.json       # Node.js dependencies
```

## License

This project is licensed under the MIT License.