from database_sqlite import db
from models import UserInDB, Quest, Achievement
from auth import get_password_hash
from datetime import datetime, timedelta
import uuid

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
        # Re-fetch to ensure we have the ID if needed (though create_user returns it with ID)
    else:
        print(f"User {veteran_username} already exists.")

    # Add data for veteran
    if veteran_user:
        user_id = veteran_user.id
        
        # Check if data already exists to avoid duplication on re-runs
        existing_quests = db.get_quests(user_id)
        if not existing_quests:
            print("Adding quests for veteran...")
            
            # Active Quests
            q1 = Quest(
                user_id=user_id,
                title="Defeat the Goblin King",
                dimension="physical",
                status="active",
                tags=["dungeon", "combat"],
                victory_condition="Kill the boss in the throne room"
            )
            db.add_quest(q1)

            q2 = Quest(
                user_id=user_id,
                title="Learn Ancient Runes",
                dimension="intellectual",
                status="active",
                tags=["magic", "study"],
                victory_condition="Read the tablet without a translator"
            )
            db.add_quest(q2)

            # Completed Quest
            q3 = Quest(
                user_id=user_id,
                title="Find the Lost Cat",
                dimension="emotional",
                status="completed",
                tags=["side-quest"],
                victory_condition="Return Mittens to the owner",
                progress=100
            )
            db.add_quest(q3)
            
            # Backlog Quest
            q4 = Quest(
                user_id=user_id,
                title="Conquer the World",
                dimension="vocational",
                status="backlog",
                tags=["long-term"],
                victory_condition="Become Supreme Ruler"
            )
            db.add_quest(q4)

            # Quest with No Dimension
            q5 = Quest(
                user_id=user_id,
                title="Wander Aimlessly",
                dimension=None,
                status="active",
                tags=["exploration"],
                victory_condition="Walk until you get tired"
            )
            db.add_quest(q5)
        else:
            print("Quests for veteran already exist.")

        existing_achievements = db.get_achievements(user_id)
        if not existing_achievements:
            print("Adding achievements for veteran...")
            
            # Achievement linked to q3
            # We need q3's ID. Since we just added it, we can't easily get it back without query or keeping ref.
            # For simplicity, we'll just create an unlinked achievement or query for q3.
            
            a1 = Achievement(
                user_id=user_id,
                title="Hero of the Village",
                context="Saved the village from a rat infestation.",
                date_completed=datetime.now() - timedelta(days=5),
                dimension="social",
                ai_description="You killed some rats. The villagers are mildly impressed.",
                ai_reward="+10 Reputation"
            )
            db.add_achievement(a1)

            # Achievement with no dimension
            a2 = Achievement(
                user_id=user_id,
                title="Found a Shiny Rock",
                context="I picked up a rock. It was shiny.",
                date_completed=datetime.now(),
                dimension=None,
                ai_description="You picked up a rock. Fascinating.",
                ai_reward="A rock."
            )
            db.add_achievement(a2)
            # But wait, db.add_quest returns the quest object, which has the ID.
            # However, in the block above I didn't capture the return values properly if I wanted to use them here.
            # Let's just fetch quests again to find "Find the Lost Cat"
            quests = db.get_quests(user_id)
            q3_id = next((q['id'] for q in quests if q['title'] == "Find the Lost Cat"), None)

            if q3_id:
                a1 = Achievement(
                    user_id=user_id,
                    title="Quest Complete: Find the Lost Cat",
                    context="Returned Mittens to the owner. The owner was a witch.",
                    date_completed=datetime.now() - timedelta(days=2),
                    dimension="emotional",
                    quest_id=q3_id,
                    ai_description="NEW ACHIEVEMENT! You saved a cat. How original. I'm sure the witch won't turn you into a toad later.",
                    ai_reward="+50 Karma points (useless)."
                )
                db.add_achievement(a1)

            # Standalone Achievement
            a2 = Achievement(
                user_id=user_id,
                title="First Blood",
                context="Killed a rat in the sewer.",
                date_completed=datetime.now() - timedelta(days=5),
                dimension="physical",
                ai_description="CONGRATULATIONS, CRAWLER! You murdered a rodent. You are truly a force to be reckoned with.",
                ai_reward="A rat tail. Don't eat it."
            )
            db.add_achievement(a2)
            
            a3 = Achievement(
                user_id=user_id,
                title="Shiny Object Syndrome",
                context="Collected 100 useless shiny rocks.",
                date_completed=datetime.now() - timedelta(days=1),
                dimension="financial",
                ai_description="OH LOOK, YOU DID SOMETHING. You filled your inventory with garbage. Typical.",
                ai_reward="Back pain."
            )
            db.add_achievement(a3)
        else:
            print("Achievements for veteran already exist.")

    print("Seeding complete.")

if __name__ == "__main__":
    seed()
