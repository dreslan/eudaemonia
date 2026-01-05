from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import date, datetime
import uuid

class QuestBase(BaseModel):
    title: str = Field(..., max_length=60)
    dimension: Optional[Literal['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual']] = None
    status: Literal['active', 'backlog', 'completed'] = 'active'
    tags: List[str] = []
    victory_condition: Optional[str] = None
    is_hidden: bool = False
    due_date: Optional[datetime] = None
    difficulty: int = 1
    xp_reward: int = 10

class QuestCreate(QuestBase):
    pass

class QuestUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=60)
    status: Optional[str] = None
    progress: Optional[int] = None
    victory_condition: Optional[str] = None
    is_hidden: Optional[bool] = None
    due_date: Optional[datetime] = None
    difficulty: Optional[int] = None
    xp_reward: Optional[int] = None

class Quest(QuestBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    progress: int = 0
    user_id: str

class UserDimensionStats(BaseModel):
    dimension: str
    total_xp: int
    level: int

class AchievementBase(BaseModel):
    title: str = Field(..., max_length=80)
    context: str # User input: What did you do?
    date_completed: datetime
    dimension: Optional[Literal['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual']] = None
    is_hidden: bool = False
    
    # AI Generated
    image_url: Optional[str] = None 
    ai_description: Optional[str] = None # DCC Voice Description
    ai_reward: Optional[str] = None # DCC Voice Reward
    quest_id: Optional[str] = None 

class AchievementCreate(AchievementBase):
    use_genai: bool = False

class AchievementUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=80)
    context: Optional[str] = None
    is_hidden: Optional[bool] = None
    quest_id: Optional[str] = None

class BulkVisibilityUpdate(BaseModel):
    is_hidden: bool

class Achievement(AchievementBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str

class UserBase(BaseModel):
    username: str
    display_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    openai_api_key: Optional[str] = None

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    disabled: bool = False
    openai_api_key: Optional[str] = None
    dimension_stats: List[UserDimensionStats] = []

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
