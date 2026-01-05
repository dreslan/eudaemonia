from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from models import Quest, QuestCreate, QuestUpdate, Achievement, AchievementCreate, AchievementUpdate, BulkVisibilityUpdate, User, UserCreate, UserUpdate, Token, UserInDB
from database_sqlite import db
import random
import json
from openai import OpenAI
from datetime import date, datetime, timezone, timedelta
from auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from auth import SECRET_KEY, ALGORITHM

app = FastAPI(title="EudaimonAI API")

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
    return {"message": "Welcome to EudaimonAI API"}

@app.get("/quests", response_model=List[Quest])
def get_quests(current_user: UserInDB = Depends(get_current_user)):
    return db.get_quests(user_id=current_user.id)

@app.post("/quests", response_model=Quest)
def create_quest(quest: QuestCreate, current_user: UserInDB = Depends(get_current_user)):
    new_quest = Quest(**quest.model_dump(), user_id=current_user.id)
    return db.add_quest(new_quest)

@app.post("/quests/bulk-visibility")
def bulk_update_quest_visibility(update_data: BulkVisibilityUpdate, current_user: UserInDB = Depends(get_current_user)):
    db.update_quest_visibility(current_user.id, update_data.is_hidden)
    return {"message": f"All quests visibility set to {update_data.is_hidden}"}

@app.post("/achievements/bulk-visibility")
def bulk_update_achievement_visibility(update_data: BulkVisibilityUpdate, current_user: UserInDB = Depends(get_current_user)):
    db.update_achievement_visibility(current_user.id, update_data.is_hidden)
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
    quests = db.get_quests(user_id=current_user.id)
    current_quest_dict = None
    
    for q in quests:
        if q['id'] == quest_id:
            current_quest_dict = q
            break
            
    if not current_quest_dict:
        raise HTTPException(status_code=404, detail="Quest not found")

    current_quest = Quest(**current_quest_dict)
    updated_fields = update_data.model_dump(exclude_unset=True)

    # Check for completion restrictions
    if current_quest.status == 'completed':
        # Allow is_hidden updates, but disallow everything else
        non_hidden_updates = {k: v for k, v in updated_fields.items() if k != 'is_hidden'}
        if non_hidden_updates:
             raise HTTPException(status_code=400, detail="Cannot edit a completed quest.")

    # State Transition Rules
    if 'status' in updated_fields and updated_fields['status'] != current_quest.status:
        new_status = updated_fields['status']
        old_status = current_quest.status
        
        if old_status == 'backlog':
            if new_status == 'completed':
                raise HTTPException(status_code=400, detail="Backlog quests must be started (Active) before they can be completed.")
            
            if new_status == 'active':
                # Auto-generate "Quest Started" achievement
                achievement_data = AchievementCreate(
                    title=f"Quest Started: {current_quest.title}",
                    context=f"Began the quest '{current_quest.title}'. Time to suffer.",
                    date_completed=datetime.now(timezone.utc),
                    dimension=current_quest.dimension,
                    quest_id=current_quest.id
                )
                new_ach = Achievement(**achievement_data.model_dump(), user_id=current_user.id)
                
                # Mock AI parts for start
                if not new_ach.image_url:
                    new_ach.image_url = "https://source.unsplash.com/random/300x400?fantasy,start"
                
                new_ach.ai_description = f"The Player has accepted the quest '{current_quest.title}'. Let's see how long they last."
                new_ach.ai_reward = "The reward of participation."
                    
                db.add_achievement(new_ach)

        if old_status == 'active':
            if new_status == 'backlog':
                raise HTTPException(status_code=400, detail="Active quests cannot be moved back to the backlog. Commit or fail.")

    # Update fields
    quest_data = current_quest.model_dump()
    quest_data.update(updated_fields)
    updated_quest = Quest(**quest_data)
    
    # Check for completion
    if updated_quest.status == 'completed' and current_quest.status != 'completed':
        # Award XP
        if updated_quest.dimension:
             db.update_user_dimension_stats(
                user_id=current_user.id,
                dimension=updated_quest.dimension,
                xp_gained=updated_quest.xp_reward or 10
            )

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
        
        dcc_intros = ["NEW ACHIEVEMENT!", "CONGRATULATIONS, PLAYER!", "OH LOOK, YOU DID SOMETHING."]
        dcc_insults = ["I suppose that's adequate.", "Don't let it go to your head.", "My grandmother could do that."]
        dcc_rewards = ["A Silver Loot Box (Empty).", "+500 XP.", "A pat on the back."]

        if not new_ach.ai_description:
            # Fix grammar: context starts with "Completed...", so "You {context.lower()}" works better.
            new_ach.ai_description = f"{random.choice(dcc_intros)} You {new_ach.context[0].lower() + new_ach.context[1:]}. {random.choice(dcc_insults)}"
        
        if not new_ach.ai_reward:
            new_ach.ai_reward = random.choice(dcc_rewards)
            
        db.add_achievement(new_ach)

    # Save back to DB
    # We need a way to update a quest in SQLite. 
    # Since we don't have a direct update_quest method in SqliteDatabase that takes a Quest object,
    # we can use add_quest which uses session.merge/add. 
    # Wait, add_quest in SqliteDatabase does `session.add(quest_db)`. 
    # If ID exists, it might fail or update depending on session behavior.
    # But `add_quest` creates a NEW QuestDB object.
    # I should add an `update_quest` method to SqliteDatabase or use `add_quest` with merge.
    # Actually, `add_quest` implementation:
    # quest_db = QuestDB(...)
    # session.add(quest_db)
    # This will likely fail if PK exists.
    # I should implement `update_quest` in SqliteDatabase properly or use `session.merge`.
    # Let's check `database_sqlite.py` again.
    # I didn't implement `update_quest` for Quest object updates, only `update_quest_visibility`.
    # I should fix `database_sqlite.py` to support updating quests.
    
    # For now, let's assume I'll fix `database_sqlite.py` to have `update_quest`.
    db.update_quest(updated_quest)
    
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
    
    # Real GenAI Logic
    if achievement.use_genai and current_user.openai_api_key:
        try:
            client = OpenAI(api_key=current_user.openai_api_key)
            
            prompt = f"""
            You are a sarcastic, condescending AI Game Master. You are occasionally begrudgingly impressed.
            The user has just completed an achievement: "{achievement.title}".
            Context: "{achievement.context}".
            Dimension: "{achievement.dimension}".
            
            Generate two things:
            1. A short description (max 2 sentences) in your voice, mocking or congratulating them.
            2. A "Reward" (text only) that is funny, useless, or slightly useful but insulting.
            
            Format: JSON with keys 'description' and 'reward'.
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a sarcastic AI game master."}, {"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            content = json.loads(response.choices[0].message.content)
            achievement.ai_description = content.get('description')
            achievement.ai_reward = content.get('reward')
            
        except Exception as e:
            print(f"GenAI Error: {e}")
            # Fallback to mock if error
            pass

    # DCC AI Voice Mocking (Fallback)
    dcc_intros = [
        "NEW ACHIEVEMENT!",
        "CONGRATULATIONS, PLAYER!",
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
    achievements = db.get_achievements(user_id=current_user.id)
    current_ach_dict = None
    
    for a in achievements:
        if a['id'] == achievement_id:
            current_ach_dict = a
            break
            
    if not current_ach_dict:
        raise HTTPException(status_code=404, detail="Achievement not found")

    current_achievement = Achievement(**current_ach_dict)
    updated_fields = update_data.model_dump(exclude_unset=True)
    
    # Use the new update_achievement method in DB
    updated_ach_dict = db.update_achievement(achievement_id, current_user.id, updated_fields)
    if not updated_ach_dict:
         raise HTTPException(status_code=404, detail="Achievement not found or update failed")
         
    return Achievement(**updated_ach_dict)

@app.get("/profile")
def get_profile(current_user: UserInDB = Depends(get_current_user)):
    quests = db.get_quests(user_id=current_user.id)
    achievements = db.get_achievements(user_id=current_user.id)
    completed_quests = [q for q in quests if q['status'] == 'completed']
    
    # Calculate Character Level
    character_level = 1
    if current_user.dimension_stats:
        # Check if all 8 dimensions are present
        unique_dims = set(s.dimension for s in current_user.dimension_stats)
        if len(unique_dims) >= 8:
             character_level = min(s.level for s in current_user.dimension_stats)
    
    # Calculate Total XP
    total_xp = sum(s.total_xp for s in current_user.dimension_stats) if current_user.dimension_stats else 0
    
    # Calculate Difficulty Breakdown
    difficulty_breakdown = {}
    for q in completed_quests:
        diff = q.get('difficulty', 1)
        difficulty_breakdown[diff] = difficulty_breakdown.get(diff, 0) + 1

    return {
        "id": current_user.id,
        "username": current_user.username,
        "display_name": current_user.display_name,
        "openai_api_key": current_user.openai_api_key,
        "level": character_level,
        "stats": {
            "quests_active": len([q for q in quests if q['status'] == 'active']),
            "quests_completed": len(completed_quests),
            "achievements_unlocked": len(achievements),
            "total_xp": total_xp,
            "quest_difficulty_breakdown": difficulty_breakdown
        },
        "dimension_stats": current_user.dimension_stats,
        "recent_achievements": achievements[-5:]
    }

@app.put("/profile", response_model=User)
def update_profile(user_update: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    updated_user = db.update_user(current_user.username, user_update.model_dump(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

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
        "display_name": user.display_name,
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

@app.get("/public/quests/{quest_id}", response_model=Quest)
def get_public_quest(quest_id: str):
    quest = db.get_quest_by_id(quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    if quest.get('is_hidden', False):
        raise HTTPException(status_code=404, detail="Quest not found")
    return quest

@app.get("/public/quests/{quest_id}/achievements", response_model=List[Achievement])
def get_public_quest_achievements(quest_id: str):
    quest = db.get_quest_by_id(quest_id)
    if not quest or quest.get('is_hidden', False):
        raise HTTPException(status_code=404, detail="Quest not found")
    
    achievements = db.get_achievements(user_id=quest['user_id'])
    return [
        a for a in achievements 
        if a.get('quest_id') == quest_id and not a.get('is_hidden', False)
    ]

@app.get("/public/achievements/{achievement_id}", response_model=Achievement)
def get_public_achievement(achievement_id: str):
    # In a real DB we would query by ID directly. Here we load all.
    ach = db.get_achievement_by_id(achievement_id)
    if ach:
        if ach.get('is_hidden', False):
            raise HTTPException(status_code=404, detail="Achievement not found")
        return ach
    raise HTTPException(status_code=404, detail="Achievement not found")

@app.post("/reset")
def reset_data(current_user: UserInDB = Depends(get_current_user)):
    # Only delete data for current user
    db.reset_user_data(current_user.id)
    return {"message": "Your data has been reset."}
