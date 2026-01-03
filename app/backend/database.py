import json
import os
from typing import List, Dict, Any, Optional
from models import Quest, Achievement, UserInDB

DB_FILE = "local_db.json"

class LocalDatabase:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), DB_FILE)
        self._ensure_db()

    def _ensure_db(self):
        if not os.path.exists(self.db_path):
            self._save_data({"quests": [], "achievements": [], "users": []})
        else:
            # Migration: Ensure users key exists
            data = self._load_data()
            if "users" not in data:
                data["users"] = []
                self._save_data(data)

    def _load_data(self) -> Dict[str, Any]:
        with open(self.db_path, "r") as f:
            return json.load(f)

    def _save_data(self, data: Dict[str, Any]):
        with open(self.db_path, "w") as f:
            json.dump(data, f, indent=4, default=str)

    def get_quests(self, user_id: Optional[str] = None) -> List[Dict]:
        data = self._load_data()
        quests = data.get("quests", [])
        if user_id:
            return [q for q in quests if q.get("user_id") == user_id]
        return quests

    def add_quest(self, quest: Quest):
        data = self._load_data()
        # Convert model to dict, handling datetime serialization if needed
        # Pydantic's model_dump(mode='json') handles this well in v2, 
        # but for simplicity we'll rely on the default=str in json.dump for now 
        # or convert explicitly.
        quest_dict = quest.model_dump(mode='json')
        data["quests"].append(quest_dict)
        self._save_data(data)
        return quest

    def get_achievements(self, user_id: Optional[str] = None) -> List[Dict]:
        data = self._load_data()
        achievements = data.get("achievements", [])
        if user_id:
            return [a for a in achievements if a.get("user_id") == user_id]
        return achievements

    def add_achievement(self, achievement: Achievement):
        data = self._load_data()
        ach_dict = achievement.model_dump(mode='json')
        data["achievements"].append(ach_dict)
        self._save_data(data)
        return achievement

    def delete_quest(self, quest_id: str) -> bool:
        data = self._load_data()
        initial_len = len(data["quests"])
        data["quests"] = [q for q in data["quests"] if q["id"] != quest_id]
        if len(data["quests"]) < initial_len:
            self._save_data(data)
            return True
        return False

    def clear_all_data(self):
        self._save_data({"quests": [], "achievements": [], "users": []})

    def get_user(self, username: str) -> Optional[UserInDB]:
        data = self._load_data()
        users = data.get("users", [])
        for user in users:
            if user["username"] == username:
                return UserInDB(**user)
        return None

    def create_user(self, user: UserInDB):
        data = self._load_data()
        user_dict = user.model_dump(mode='json')
        data["users"].append(user_dict)
        self._save_data(data)
        return user

    def update_user(self, username: str, updates: Dict[str, Any]) -> Optional[UserInDB]:
        data = self._load_data()
        users = data.get("users", [])
        for i, user in enumerate(users):
            if user["username"] == username:
                # Update fields
                for key, value in updates.items():
                    if value is not None:
                        user[key] = value
                
                updated_user = UserInDB(**user)
                users[i] = updated_user.model_dump(mode='json')
                self._save_data(data)
                return updated_user
        return None

db = LocalDatabase()
