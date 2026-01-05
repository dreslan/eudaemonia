from database_sqlite import db
from models import UserInDB, Quest, Achievement
from auth import get_password_hash
from datetime import datetime, timedelta
import uuid
import random

def seed():
    print("Seeding data...")

    # 1. Create 'noob' user (Fresh Meat)
    noob_username = "noob"
    if not db.get_user(noob_username):
        print(f"Creating user: {noob_username}")
        noob_user = UserInDB(
            username=noob_username,
            display_name="Fresh Meat",
            hashed_password=get_password_hash("password"),
            disabled=False
        )
        db.create_user(noob_user)
    else:
        print(f"User {noob_username} already exists.")

    # 2. Create 'veteran' user (Princess Donut)
    veteran_username = "veteran"
    veteran_user = db.get_user(veteran_username)
    if not veteran_user:
        print(f"Creating user: {veteran_username}")
        veteran_user = UserInDB(
            username=veteran_username,
            display_name="Princess Donut",
            hashed_password=get_password_hash("password"),
            disabled=False
        )
        db.create_user(veteran_user)
        veteran_user = db.get_user(veteran_username) # Fetch to get ID
    else:
        print(f"User {veteran_username} already exists.")

    # Add data for veteran
    if veteran_user:
        user_id = veteran_user.id
        
        print("Seeding quests for veteran...")
        
        difficulty_map = {
            1: 10,
            2: 50,
            3: 250,
            4: 1000,
            5: 5000
        }

        quests_data = [
            # Intellectual
            {"title": "Read 'The Art of War'", "dimension": "intellectual", "difficulty": 1, "status": "completed"},
            {"title": "Learn Basic Python", "dimension": "intellectual", "difficulty": 2, "status": "completed"},
            {"title": "Master Quantum Physics", "dimension": "intellectual", "difficulty": 5, "status": "active"},
            
            # Physical
            {"title": "Morning Stretch", "dimension": "physical", "difficulty": 1, "status": "completed"},
            {"title": "Run a 5k", "dimension": "physical", "difficulty": 2, "status": "completed"},
            {"title": "Marathon Training", "dimension": "physical", "difficulty": 3, "status": "active"},
            {"title": "Ironman Triathlon", "dimension": "physical", "difficulty": 5, "status": "backlog"},

            # Financial
            {"title": "Skip Coffee", "dimension": "financial", "difficulty": 1, "status": "completed"},
            {"title": "Setup 401k", "dimension": "financial", "difficulty": 2, "status": "completed"},
            {"title": "Save 6 Months Expenses", "dimension": "financial", "difficulty": 3, "status": "active"},
            {"title": "Become a Millionaire", "dimension": "financial", "difficulty": 5, "status": "backlog"},

            # Environmental
            {"title": "Recycle Cans", "dimension": "environmental", "difficulty": 1, "status": "completed"},
            {"title": "Plant a Tree", "dimension": "environmental", "difficulty": 2, "status": "completed"},
            {"title": "Go Zero Waste", "dimension": "environmental", "difficulty": 4, "status": "active"},

            # Vocational
            {"title": "Update Resume", "dimension": "vocational", "difficulty": 1, "status": "completed"},
            {"title": "Get a Certification", "dimension": "vocational", "difficulty": 2, "status": "completed"},
            {"title": "Lead a Major Project", "dimension": "vocational", "difficulty": 3, "status": "active"},
            {"title": "Become CEO", "dimension": "vocational", "difficulty": 5, "status": "backlog"},

            # Social
            {"title": "Call Mom", "dimension": "social", "difficulty": 1, "status": "completed"},
            {"title": "Host Dinner Party", "dimension": "social", "difficulty": 2, "status": "completed"},
            {"title": "Public Speaking Event", "dimension": "social", "difficulty": 3, "status": "active"},

            # Emotional
            {"title": "Deep Breath", "dimension": "emotional", "difficulty": 1, "status": "completed"},
            {"title": "Journaling Habit", "dimension": "emotional", "difficulty": 2, "status": "completed"},
            {"title": "Therapy Sessions", "dimension": "emotional", "difficulty": 3, "status": "active"},

            # Spiritual
            {"title": "Meditate 5 Mins", "dimension": "spiritual", "difficulty": 1, "status": "completed"},
            {"title": "Read Sacred Texts", "dimension": "spiritual", "difficulty": 2, "status": "completed"},
            {"title": "Silent Retreat", "dimension": "spiritual", "difficulty": 4, "status": "active"},
        ]

        # Generate massive amount of quests to level up
        dimensions = ['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual']
        
        # Ensure at least one Legendary (Rank 5) completed
        quests_data.append({"title": "Master the Universe", "dimension": "spiritual", "difficulty": 5, "status": "completed"})
        
        # Ensure a few Epic (Rank 4) completed
        quests_data.append({"title": "Write a Novel", "dimension": "intellectual", "difficulty": 4, "status": "completed"})
        quests_data.append({"title": "Climb Everest", "dimension": "physical", "difficulty": 4, "status": "completed"})

        # Generate filler quests to ensure Level > 5 in all dimensions
        # Level 5 requires 400 XP.
        # We will add enough Rank 1, 2, 3 quests.
        
        for dim in dimensions:
            # Add 5 Rank 3 (Rare) -> 1250 XP
            for i in range(5):
                quests_data.append({"title": f"{dim.capitalize()} Mastery {i+1}", "dimension": dim, "difficulty": 3, "status": "completed"})
            
            # Add 10 Rank 2 (Uncommon) -> 500 XP
            for i in range(10):
                quests_data.append({"title": f"{dim.capitalize()} Practice {i+1}", "dimension": dim, "difficulty": 2, "status": "completed"})
                
            # Add 20 Rank 1 (Common) -> 200 XP
            for i in range(20):
                quests_data.append({"title": f"{dim.capitalize()} Routine {i+1}", "dimension": dim, "difficulty": 1, "status": "completed"})

        existing_quests = db.get_quests(user_id)
        existing_titles = [q['title'] for q in existing_quests]

        for q in quests_data:
            if q['title'] not in existing_titles:
                print(f"Adding quest: {q['title']} ({q['status']})")
                xp = difficulty_map.get(q['difficulty'], 10)
                
                new_quest = Quest(
                    user_id=user_id,
                    title=q['title'],
                    dimension=q['dimension'],
                    status=q['status'],
                    difficulty=q['difficulty'],
                    xp_reward=xp,
                    tags=[q['dimension'], "seeded"],
                    victory_condition=f"Complete the task: {q['title']}"
                )
                db.add_quest(new_quest)

                if q['status'] == 'completed':
                    # Award XP
                    db.update_user_dimension_stats(user_id, q['dimension'], xp)
                    
                    # Add Achievement
                    ach = Achievement(
                        user_id=user_id,
                        title=f"Completed: {q['title']}",
                        context=f"Finished the quest {q['title']}",
                        date_completed=datetime.now() - timedelta(days=random.randint(1, 30)),
                        dimension=q['dimension'],
                        quest_id=new_quest.id,
                        ai_description=f"You did it. {q['title']} is done. Are you happy now?",
                        ai_reward=f"+{xp} XP"
                    )
                    db.add_achievement(ach)
            else:
                print(f"Skipping existing quest: {q['title']}")

        # Force recalculate stats to ensure they are correct
        print("Recalculating veteran stats...")
        db.recalculate_user_stats(user_id)

    print("Seeding complete.")

if __name__ == "__main__":
    seed()
