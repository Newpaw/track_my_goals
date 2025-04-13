# 📱 Track My Goals – Architecture Specification

## 🧐 Purpose

The purpose of this project is to develop a cross-platform mobile application called **Track My Goals** that allows users to define personal goals, track daily progress, visualize historical data, and receive motivational feedback. The application is designed to support **multiple users**, **cloud synchronization**, **offline access**, and optionally **AI-driven coaching**.

---

## 🧩 High-Level Architecture Overview

```
+-------------------+        HTTPS/REST        +---------------------+
|  React Native App |  <--------------------> |   FastAPI Backend    |
+-------------------+                         +----------+----------+
       |                                                |
       v                                                v
+--------------+                                  +--------------+
| SQLite/Async |                                  | PostgreSQL or|
|  Local Cache |                                  | SQLite DB    |
+--------------+                                  +--------------+
       |                                                |
       v                                                v
+--------------+                                  +--------------+
| Notifications|                                  | AI Feedback  |
| (Expo API)   | <--------- (Optional) ---------- | (OpenAI/Buddy)|
+--------------+                                  +--------------+
```

---

## 📦 Stack Overview

### Frontend (Mobile App)
- **Framework**: [React Native](https://reactnative.dev/)
- **Toolkit**: [Expo](https://expo.dev/)
- **Styling**: [Tailwind CSS (via NativeWind)](https://www.nativewind.dev/)
- **Navigation**: `@react-navigation/native`
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **HTTP Client**: `axios`
- **Local Storage**: `expo-sqlite` and/or `@react-native-async-storage/async-storage`
- **Notifications**: `expo-notifications`

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.10+
- **ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (built on SQLAlchemy)
- **Database**: SQLite (for dev) or PostgreSQL (for production)
- **Authentication**: OAuth2 + JWT tokens
- **Password Hashing**: `bcrypt`
- **Token Management**: `python-jose` or `PyJWT`
- **Scheduling (optional)**: `APScheduler`
- **AI Integration**: OpenAI API or Buddy API

---

## 🧑‍💻 Functional Modules

### 1. **Authentication**
- Email + password registration/login
- JWT-based session management
- Secure password hashing (bcrypt)
- Optionally magic links or Google OAuth in future

### 2. **Goal Management**
- Create, edit, and delete personal goals
- Define target date and goal type (`binary` or `quantitative`)
- Assign goals to specific authenticated users

### 3. **Daily Check-ins**
- Record daily progress towards a goal
- Add optional note or numeric value
- Show check-in history per goal

### 4. **Progress Visualization**
- Success streaks, overall completion rate
- Line/bar chart of daily progress
- Calendar view of check-ins

### 5. **Notifications**
- Local reminders to perform check-ins
- Configurable time
- Optional push notifications via Expo

### 6. **AI Coaching (Optional / Future Phase)**
- Analyze user's progress trends
- Provide motivational messages via OpenAI/Buddy
- Generate weekly summaries

---

## 🧱 Data Model (Simplified ERD)

### User
```python
id: UUID
email: str
hashed_password: str
created_at: datetime
```

### Goal
```python
id: UUID
user_id: UUID  # foreign key
title: str
description: Optional[str]
target_date: date
type: str  # 'binary' | 'quantitative'
```

### CheckIn
```python
id: UUID
goal_id: UUID  # foreign key
date: date
status: Union[bool, float]  # based on goal type
note: Optional[str]
```

---

## 🔐 Security Model

- Authentication: JWT bearer tokens
- Authorization: All goal and check-in operations are scoped to the current authenticated user
- Passwords: Stored as salted hashes (bcrypt)
- API Security:
  - `Authorization: Bearer <token>` in headers
  - Middleware for validating token and injecting current user context

---

## 🔗 API Endpoints Overview

| Method | Endpoint               | Description                            | Auth Required |
|--------|------------------------|----------------------------------------|---------------|
| POST   | `/auth/register`       | Register a new user                    | ❌             |
| POST   | `/auth/login`          | Login and get JWT                      | ❌             |
| GET    | `/goals`               | Get all goals for current user         | ✅             |
| POST   | `/goals`               | Create a new goal                      | ✅             |
| GET    | `/goals/{goal_id}`     | Get detail of a single goal            | ✅             |
| DELETE | `/goals/{goal_id}`     | Delete a goal                          | ✅             |
| POST   | `/checkins`            | Create a new daily check-in            | ✅             |
| GET    | `/checkins/{goal_id}`  | Get all check-ins for a specific goal | ✅             |
| GET    | `/summary/{goal_id}`   | (optional) Get AI-generated summary    | ✅             |

---

## 🚁 Communication Protocols

| Channel            | Protocol      | Notes                                |
|--------------------|---------------|--------------------------------------|
| App ⇄ Backend      | HTTPS + REST  | JSON-based requests/responses        |
| Backend ⇄ AI       | HTTPS + REST  | Calls to OpenAI/Buddy APIs           |
| Notifications      | Expo Push API | Or native local notifications        |
| Auth Token         | JWT           | Stored securely in app               |

---

## 🚀 Deployment

### Backend
- Containerized via **Docker**
- Deployable to:
  - [Railway](https://railway.app/)
  - [Render](https://render.com/)
  - O2 internal infrastructure (if applicable)
- Uses `.env` for secret/config injection

### Frontend (Expo App)
- Run locally via `expo start`
- Build for production with:
  ```bash
  npx expo build:android
  npx expo build:ios
  ```
- OTA updates via [EAS Update](https://docs.expo.dev/eas-update/introduction/)

---

## ✅ MVP Success Criteria

- [x] User registration and login
- [x] Create, list, delete goals
- [x] Daily check-ins with notes
- [x] View historical data per goal
- [x] Local storage for offline use
- [x] Secure and multi-user capable API
- [ ] Push notification reminders
- [ ] AI-based feedback (optional)

---

## 📊 Future Enhancements

- AI-generated trend summaries and predictions
- Custom goal types and tagging
- Social features (accountability partners)
- Voice-based journaling with transcription
- Wearable integration (e.g., Apple Health)

---

## 🔧 Development Scripts

**Backend**
```bash
uvicorn app.main:app --reload
```

**Frontend**
```bash
npx expo start
```

---

## 👥 Authors
- Project Owner: Jan Novopacký
- Backend: Python / FastAPI
- Mobile App: React Native + Expo
- AI Coaching: Buddy / OpenAI integration (future phase)

