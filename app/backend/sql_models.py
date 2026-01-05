from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import json

Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    openai_api_key = Column(String, nullable=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

    quests = relationship("QuestDB", back_populates="user")
    achievements = relationship("AchievementDB", back_populates="user")
    dimension_stats = relationship("UserDimensionStatsDB", back_populates="user")

class QuestDB(Base):
    __tablename__ = "quests"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    dimension = Column(String)
    status = Column(String, default="active")
    tags = Column(Text, default="[]") # Stored as JSON string
    victory_condition = Column(String, nullable=True)
    is_hidden = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Integer, default=0)
    difficulty = Column(Integer, default=1)
    xp_reward = Column(Integer, default=10)

    user = relationship("UserDB", back_populates="quests")

class AchievementDB(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    context = Column(String)
    date_completed = Column(DateTime)
    dimension = Column(String)
    is_hidden = Column(Boolean, default=False)
    
    image_url = Column(String, nullable=True)
    ai_description = Column(String, nullable=True)
    ai_reward = Column(String, nullable=True)
    quest_id = Column(String, nullable=True)

    user = relationship("UserDB", back_populates="achievements")

class UserDimensionStatsDB(Base):
    __tablename__ = "user_dimension_stats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    dimension = Column(String)
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)

    user = relationship("UserDB", back_populates="dimension_stats")
