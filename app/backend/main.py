from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from models import Quest, QuestCreate, QuestUpdate, Achievement, AchievementCreate, AchievementUpdate, BulkVisibilityUpdate, User, UserCreate, Token, UserInDB
from database import db
import random
from datetime import date, datetime, timezone, timedelta
from auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from auth import SECRET_KEY, ALGORITHM

app = FastAPI(title="QuestVault API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.get_user(username)
    if user is None:
        raise credentials_exception
    return user

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=User)
def register_user(user: UserCreate):
    if db.get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(**user.model_dump(), hashed_password=hashed_password)
    return db.create_user(user_in_db)

@app.get("/")
def read_root():
    return {"message": "Welcome to QuestVault API"}

@app.get("/quests", response_model=List[Quest])
def get_quests(current_user: UserInDB = Depends(get_current_user)):
    return db.get_quests(user_id=current_user.id)

@app.post("/quests", response_model=Quest)
def create_quest(quest: QuestCreate, current_user: UserInDB = Depends(get_current_user)):
    new_quest = Quest(**quest.model_dump(), user_id=current_user.id)
    return db.add_quest(new_quest)

@app.post("/quests/bulk-visibility")
def bulk_update_quest_visibility(update_data: BulkVisibilityUpdate, current_user: UserInDB = Depends(get_current_user)):
    quests = db.get_quests(user_id=current_user.id)
    updated_quests = []
    # We need to update in the main list, so we might need a better DB method or just load all, update ours, save all.
    # Since db.get_quests returns a copy or filtered list, updating it won't save.
    # I should probably add a bulk update method to DB or iterate carefully.
    # For now, I'll implement a simple loop using db._load_data to be safe, or add a method to DB.
    # Actually, let's just use the DB methods if possible, but DB doesn't have bulk update.
    # I'll read all, update matching, save.
    all_quests = db._load_data().get("quests", [])
    for q in all_quests:
        if q.get("user_id") == current_user.id:
            q['is_hidden'] = update_data.is_hidden
    
    db._save_data({"quests": all_quests, "achievements": db.get_achievements(), "users": db._load_data().get("users", [])})
    return {"message": f"All quests visibility set to {update_data.is_hidden}"}

@app.post("/achievements/bulk-visibility")
def bulk_update_achievement_visibility(update_data: BulkVisibilityUpdate, current_user: UserInDB = Depends(get_current_user)):
    all_achievements = db._load_data().get("achievements", [])
    for a in all_achievements:
        if a.get("user_id") == current_user.id:
            a['is_hidden'] = update_data.is_hidden
    
    db._save_data({"quests": db.get_quests(), "achievements": all_achievements, "users": db._load_data().get("users", [])})
    return {"message": f"All achievements visibility set to {update_data.is_hidden}"}

@app.get("/quests/{quest_id}", response_model=Quest)
def get_quest(quest_id: str, current_user: UserInDB = Depends(get_current_user)):
    quests = db.get_quests(user_id=current_user.id)
    for q in quests:
        if q['id'] == quest_id:
            return q
    raise HTTPException(status_code=404, detail="Quest not found")

@app.patch("/quests/{quest_id}", response_model=Quest)
def update_quest(quest_id: str, update_data: QuestUpdate, current_user: UserInDB = Depends(get_current_user)):
    # We need to load all quests to update the file correctly, but verify ownership
    all_quests = db._load_data().get("quests", [])
    quest_index = -1
    current_quest_dict = None
    
    for i, q in enumerate(all_quests):
        if q['id'] == quest_id and q.get('user_id') == current_user.id:
            quest_index = i
            current_quest_dict = q
            break
            
    if quest_index == -1:
        raise HTTPException(status_code=404, detail="Quest not found")

    # Update fields
    current_quest = Quest(**current_quest_dict)
    updated_fields = update_data.model_dump(exclude_unset=True)
    
    quest_data = current_quest.model_dump()
    quest_data.update(updated_fields)
    updated_quest = Quest(**quest_data)
    
    # Check for completion
    if updated_quest.status == 'completed' and current_quest.status != 'completed':
        # Auto-generate achievement
        achievement_data = AchievementCreate(
            title=f"Quest Complete: {updated_quest.title}",
            context=f"Completed the quest '{updated_quest.title}'. Victory Condition: {updated_quest.victory_condition or 'Survival'}",
            date_completed=datetime.now(timezone.utc),
            dimension=updated_quest.dimension,
            quest_id=updated_quest.id
        )
        # Manually call logic from create_achievement to include user_id
        # Duplicate logic for now or refactor. I'll duplicate for safety and speed.
        new_ach = Achievement(**achievement_data.model_dump(), user_id=current_user.id)
        
        # Mock AI parts
        if not new_ach.image_url:
            new_ach.image_url = "https://source.unsplash.com/random/300x400?fantasy,card"
        
        dcc_intros = ["NEW ACHIEVEMENT!", "CONGRATULATIONS, CRAWLER!", "OH LOOK, YOU DID SOMETHING."]
        dcc_insults = ["I suppose that's adequate.", "Don't let it go to your head.", "My grandmother could do that."]
        dcc_rewards = ["A Silver Loot Box (Empty).", "+500 XP.", "A pat on the back."]

        if not new_ach.ai_description:
            new_ach.ai_description = f"{random.choice(dcc_intros)} You have managed to {new_ach.context}. {random.choice(dcc_insults)}"
        
        if not new_ach.ai_reward:
            new_ach.ai_reward = random.choice(dcc_rewards)
            
        db.add_achievement(new_ach)

    # Save back to DB
    all_quests[quest_index] = updated_quest.model_dump(mode='json')
    # Reload achievements to include the new one if added
    db._save_data({"quests": all_quests, "achievements": db._load_data().get("achievements", []), "users": db._load_data().get("users", [])})
    return updated_quest

@app.delete("/quests/{quest_id}")
def delete_quest(quest_id: str, current_user: UserInDB = Depends(get_current_user)):
    # db.delete_quest doesn't check user, so we should check first or update db.delete_quest
    # Let's check first
    quests = db.get_quests(user_id=current_user.id)
    if not any(q['id'] == quest_id for q in quests):
        raise HTTPException(status_code=404, detail="Quest not found")
        
    if db.delete_quest(quest_id):
        return {"message": "Quest deleted successfully"}
    raise HTTPException(status_code=404, detail="Quest not found")

@app.get("/achievements", response_model=List[Achievement])
def get_achievements(current_user: UserInDB = Depends(get_current_user)):
    return db.get_achievements(user_id=current_user.id)

@app.post("/achievements", response_model=Achievement)
def create_achievement(achievement: AchievementCreate, current_user: UserInDB = Depends(get_current_user)):
    # Simulate DCC AI Generation
    if not achievement.image_url:
        achievement.image_url = "https://source.unsplash.com/random/300x400?fantasy,card"
    
    # DCC AI Voice Mocking
    dcc_intros = [
        "NEW ACHIEVEMENT!",
        "CONGRATULATIONS, CRAWLER!",
        "OH LOOK, YOU DID SOMETHING."
    ]
    
    dcc_insults = [
        "I suppose that's adequate, for a hairless ape.",
        "Don't let it go to your head. You're still squishy.",
        "My grandmother could do that, and she's a subroutine.",
        "You want a cookie? Too bad."
    ]
    
    dcc_rewards = [
        "A Silver Loot Box (It's empty).",
        "+500 XP and a sense of impending doom.",
        "A pat on the back. Not really.",
        "The realization that this is all meaningless."
    ]

    if not achievement.ai_description:
        achievement.ai_description = f"{random.choice(dcc_intros)} You have managed to {achievement.context}. {random.choice(dcc_insults)}"
    
    if not achievement.ai_reward:
        achievement.ai_reward = random.choice(dcc_rewards)
    
    new_achievement = Achievement(**achievement.model_dump(), user_id=current_user.id)
    return db.add_achievement(new_achievement)

@app.get("/achievements/{achievement_id}", response_model=Achievement)
def get_achievement(achievement_id: str, current_user: UserInDB = Depends(get_current_user)):
    achievements = db.get_achievements(user_id=current_user.id)
    for a in achievements:
        if a['id'] == achievement_id:
            return a
    raise HTTPException(status_code=404, detail="Achievement not found")

@app.patch("/achievements/{achievement_id}", response_model=Achievement)
def update_achievement(achievement_id: str, update_data: AchievementUpdate, current_user: UserInDB = Depends(get_current_user)):
    all_achievements = db._load_data().get("achievements", [])
    ach_index = -1
    current_ach_dict = None
    
    for i, a in enumerate(all_achievements):
        if a['id'] == achievement_id and a.get('user_id') == current_user.id:
            ach_index = i
            current_ach_dict = a
            break
            
    if ach_index == -1:
        raise HTTPException(status_code=404, detail="Achievement not found")

    current_achievement = Achievement(**current_ach_dict)
    updated_fields = update_data.model_dump(exclude_unset=True)
    
    achievement_data = current_achievement.model_dump()
    achievement_data.update(updated_fields)
    updated_achievement = Achievement(**achievement_data)
    
    all_achievements[ach_index] = updated_achievement.model_dump(mode='json')
    db._save_data({"quests": db._load_data().get("quests", []), "achievements": all_achievements, "users": db._load_data().get("users", [])})
    return updated_achievement

@app.get("/profile")
def get_profile(current_user: UserInDB = Depends(get_current_user)):
    quests = db.get_quests(user_id=current_user.id)
    achievements = db.get_achievements(user_id=current_user.id)
    completed_quests = [q for q in quests if q['status'] == 'completed']
    
    return {
        "username": current_user.username,
        "level": 1 + (len(achievements) // 5),
        "stats": {
            "quests_active": len([q for q in quests if q['status'] == 'active']),
            "quests_completed": len(completed_quests),
            "achievements_unlocked": len(achievements)
        },
        "recent_achievements": achievements[-5:]
    }

@app.get("/public/profile/{username}")
def get_public_profile(username: str):
    user = db.get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    quests = db.get_quests(user_id=user.id)
    achievements = db.get_achievements(user_id=user.id)
    
    public_quests = [q for q in quests if not q.get('is_hidden', False)]
    public_achievements = [a for a in achievements if not a.get('is_hidden', False)]
    
    completed_quests = [q for q in public_quests if q['status'] == 'completed']
    
    return {
        "username": user.username,
        "level": 1 + (len(public_achievements) // 5),
        "stats": {
            "quests_active": len([q for q in public_quests if q['status'] == 'active']),
            "quests_completed": len(completed_quests),
            "achievements_unlocked": len(public_achievements)
        },
        "recent_achievements": public_achievements[-5:],
        "quests": public_quests,
        "achievements": public_achievements
    }

@app.get("/public/achievements/{achievement_id}", response_model=Achievement)
def get_public_achievement(achievement_id: str):
    # In a real DB we would query by ID directly. Here we load all.
    all_achievements = db._load_data().get("achievements", [])
    for a in all_achievements:
        if a['id'] == achievement_id:
            if a.get('is_hidden', False):
                raise HTTPException(status_code=404, detail="Achievement not found")
            return a
    raise HTTPException(status_code=404, detail="Achievement not found")

@app.post("/reset")
def reset_data(current_user: UserInDB = Depends(get_current_user)):
    # Only delete data for current user
    all_quests = db._load_data().get("quests", [])
    all_achievements = db._load_data().get("achievements", [])
    
    new_quests = [q for q in all_quests if q.get("user_id") != current_user.id]
    new_achievements = [a for a in all_achievements if a.get("user_id") != current_user.id]
    
    db._save_data({"quests": new_quests, "achievements": new_achievements, "users": db._load_data().get("users", [])})
    return {"message": "Your data has been reset."}
