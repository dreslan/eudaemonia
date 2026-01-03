from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sql_models import Base, UserDB, QuestDB, AchievementDB
from models import Quest, Achievement, UserInDB
from typing import List, Dict, Any, Optional
import json
import os

SQLITE_FILE = "questvault.db"

class SqliteDatabase:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), SQLITE_FILE)
        self.engine = create_engine(f"sqlite:///{self.db_path}", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def _to_dict(self, obj):
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    def get_quests(self, user_id: Optional[str] = None) -> List[Dict]:
        session = self.SessionLocal()
        try:
            query = session.query(QuestDB)
            if user_id:
                query = query.filter(QuestDB.user_id == user_id)
            quests = query.all()
            results = []
            for q in quests:
                q_dict = self._to_dict(q)
                q_dict['tags'] = json.loads(q_dict['tags'])
                results.append(q_dict)
            return results
        finally:
            session.close()

    def add_quest(self, quest: Quest):
        session = self.SessionLocal()
        try:
            quest_db = QuestDB(
                id=quest.id,
                user_id=quest.user_id,
                title=quest.title,
                dimension=quest.dimension,
                status=quest.status,
                tags=json.dumps(quest.tags),
                victory_condition=quest.victory_condition,
                is_hidden=quest.is_hidden,
                created_at=quest.created_at,
                progress=quest.progress
            )
            session.add(quest_db)
            session.commit()
            session.refresh(quest_db)
            return quest
        finally:
            session.close()

    def get_achievements(self, user_id: Optional[str] = None) -> List[Dict]:
        session = self.SessionLocal()
        try:
            query = session.query(AchievementDB)
            if user_id:
                query = query.filter(AchievementDB.user_id == user_id)
            achievements = query.all()
            return [self._to_dict(a) for a in achievements]
        finally:
            session.close()

    def add_achievement(self, achievement: Achievement):
        session = self.SessionLocal()
        try:
            ach_db = AchievementDB(
                id=achievement.id,
                user_id=achievement.user_id,
                title=achievement.title,
                context=achievement.context,
                date_completed=achievement.date_completed,
                dimension=achievement.dimension,
                is_hidden=achievement.is_hidden,
                image_url=achievement.image_url,
                ai_description=achievement.ai_description,
                ai_reward=achievement.ai_reward,
                quest_id=achievement.quest_id
            )
            session.add(ach_db)
            session.commit()
            session.refresh(ach_db)
            return achievement
        finally:
            session.close()

    def delete_quest(self, quest_id: str) -> bool:
        session = self.SessionLocal()
        try:
            quest = session.query(QuestDB).filter(QuestDB.id == quest_id).first()
            if quest:
                session.delete(quest)
                session.commit()
                return True
            return False
        finally:
            session.close()

    def update_quest(self, quest: Quest):
        session = self.SessionLocal()
        try:
            quest_db = session.query(QuestDB).filter(QuestDB.id == quest.id).first()
            if quest_db:
                quest_db.title = quest.title
                quest_db.dimension = quest.dimension
                quest_db.status = quest.status
                quest_db.tags = json.dumps(quest.tags)
                quest_db.victory_condition = quest.victory_condition
                quest_db.is_hidden = quest.is_hidden
                quest_db.progress = quest.progress
                # created_at and user_id should not change
                session.commit()
                session.refresh(quest_db)
                return quest
            return None
        finally:
            session.close()

    def get_user(self, username: str) -> Optional[UserInDB]:
        session = self.SessionLocal()
        try:
            user = session.query(UserDB).filter(UserDB.username == username).first()
            if user:
                return UserInDB(**self._to_dict(user))
            return None
        finally:
            session.close()

    def create_user(self, user: UserInDB):
        session = self.SessionLocal()
        try:
            user_db = UserDB(
                id=user.id,
                username=user.username,
                display_name=user.display_name,
                hashed_password=user.hashed_password,
                disabled=user.disabled
            )
            session.add(user_db)
            session.commit()
            session.refresh(user_db)
            return user
        finally:
            session.close()

    def update_user(self, username: str, updates: Dict[str, Any]) -> Optional[UserInDB]:
        session = self.SessionLocal()
        try:
            user = session.query(UserDB).filter(UserDB.username == username).first()
            if user:
                for key, value in updates.items():
                    if hasattr(user, key):
                        setattr(user, key, value)
                session.commit()
                session.refresh(user)
                return UserInDB(**self._to_dict(user))
            return None
        finally:
            session.close()

    # New methods to replace direct _load_data access
    
    def update_quest_visibility(self, user_id: str, is_hidden: bool):
        session = self.SessionLocal()
        try:
            session.query(QuestDB).filter(QuestDB.user_id == user_id).update({"is_hidden": is_hidden})
            session.commit()
        finally:
            session.close()

    def update_achievement_visibility(self, user_id: str, is_hidden: bool):
        session = self.SessionLocal()
        try:
            session.query(AchievementDB).filter(AchievementDB.user_id == user_id).update({"is_hidden": is_hidden})
            session.commit()
        finally:
            session.close()

    def get_achievement_by_id(self, achievement_id: str) -> Optional[Dict]:
        session = self.SessionLocal()
        try:
            ach = session.query(AchievementDB).filter(AchievementDB.id == achievement_id).first()
            if ach:
                return self._to_dict(ach)
            return None
        finally:
            session.close()

    def update_achievement(self, achievement_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict]:
        session = self.SessionLocal()
        try:
            ach = session.query(AchievementDB).filter(AchievementDB.id == achievement_id, AchievementDB.user_id == user_id).first()
            if ach:
                for key, value in updates.items():
                    if hasattr(ach, key):
                        setattr(ach, key, value)
                session.commit()
                session.refresh(ach)
                return self._to_dict(ach)
            return None
        finally:
            session.close()

    def reset_user_data(self, user_id: str):
        session = self.SessionLocal()
        try:
            session.query(QuestDB).filter(QuestDB.user_id == user_id).delete()
            session.query(AchievementDB).filter(AchievementDB.user_id == user_id).delete()
            session.commit()
        finally:
            session.close()

db = SqliteDatabase()
