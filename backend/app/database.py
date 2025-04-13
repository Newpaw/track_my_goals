from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from typing import Generator
import os

# Use SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./track_my_goals.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=True  # Set to False in production
)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for declarative models
Base = declarative_base()

def create_db_and_tables():
    """Create database tables from SQLAlchemy models"""
    Base.metadata.create_all(bind=engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency for getting a database session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()