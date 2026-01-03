from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import date, datetime
import uuid

class QuestBase(BaseModel):
    title: str
    dimension: Literal['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual']
    status: Literal['active', 'backlog', 'maybe', 'completed'] = 'active'
    tags: List[str] = []
    victory_condition: Optional[str] = None
    is_hidden: bool = False

class QuestCreate(QuestBase):
    pass

class QuestUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    victory_condition: Optional[str] = None
    is_hidden: Optional[bool] = None

class Quest(QuestBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    progress: int = 0
    user_id: str

class AchievementBase(BaseModel):
    title: str
    context: str # User input: What did you do?
    date_completed: datetime
    dimension: Literal['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual']
    is_hidden: bool = False
    
    # AI Generated
    image_url: Optional[str] = None 
    ai_description: Optional[str] = None # DCC Voice Description
    ai_reward: Optional[str] = None # DCC Voice Reward
    quest_id: Optional[str] = None 

class AchievementCreate(AchievementBase):
    pass

class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    context: Optional[str] = None
    is_hidden: Optional[bool] = None

class BulkVisibilityUpdate(BaseModel):
    is_hidden: bool

class Achievement(AchievementBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    disabled: bool = False

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
