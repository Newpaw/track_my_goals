# SQLModel data models
from app.models.user import User, UserCreate, UserRead, UserLogin, Token, TokenPayload
from app.models.goal import Goal, GoalCreate, GoalRead, GoalUpdate, GoalType
from app.models.checkin import CheckIn, CheckInCreate, CheckInRead, CheckInUpdate

# Import these models to ensure SQLModel creates the tables
__all__ = [
    "User", "UserCreate", "UserRead", "UserLogin", "Token", "TokenPayload",
    "Goal", "GoalCreate", "GoalRead", "GoalUpdate", "GoalType",
    "CheckIn", "CheckInCreate", "CheckInRead", "CheckInUpdate",
]