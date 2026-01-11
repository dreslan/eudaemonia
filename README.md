# Eudaemonia

> *"Happiness depends upon ourselves."* — Aristotle

**Eudaemonia** is a goal tracker dressed up as an RPG collectible Card Game. The game, if you play it as a game, attempts to guide you toward [https://en.wikipedia.org/wiki/Eudaimonia](eudaimonia)—a state of flourishing and well-being. 

At the center of the game is the "System AI," who is repsonsible for transforming your goals into Quests and delivering punchy one liners along the way as you complete primarily self appointed tasks and collect achievements.

In other words, this application aims to gamifify your personal growth by treating you as a Character in an RPG tasked with increasing your stats across different real-life domains (discussed below).

## The Philosophy

Eudaemonia is built upon the **8 Dimensions of Wellness** framework to wellness [described in the literature](https://scholar.google.com/citations?view_op=view_citation&hl=en&user=7hbXhs0AAAAJ&citation_for_view=7hbXhs0AAAAJ:iH-uZ7U-co4C) described by [https://scholar.google.com/citations?user=7hbXhs0AAAAJ&hl=en](Margaret Swarbrick) and others. 

The "System AI" accepts goals from the player (you), converts them into "Quests" by assigning them a difficulty ranking (1-5), and acts as a third party arbiter of your progress as you update your Quests (via a quest log). The game further analyzes your activities and helps you maintain balance, ensuring you don't max out one stat while neglecting others (if you want to play it in that way).

### The 8 Dimensions

These are the basis for your Character's Stats. You can earn XP in any of these dimensions.

1.  **🧠 Intellectual:** Expanding knowledge and skills.
2.  **💪 Physical:** Health, nutrition, and sleep.
3.  **💰 Financial:** Resource management and security.
4.  **🏡 Environmental:** Harmony with your surroundings.
5.  **🛠 Vocational:** Satisfaction and enrichment in work.
6.  **🤝 Social:** Connection and community.
7.  **🎨 Emotional:** Coping effectively with life.
8.  **✨ Spiritual:** Purpose and meaning.

### Why the 8 Dimensions?

We could have built EudaimonAI on other wellness frameworks:

- **Carol Ryff’s Six-Factor Model**
- **Corey Keyes' Flourishing**
- **Seligman’s PERMA** model

The thing is, all of these frameworks aim to move the user towards the same distination: holistic flourishing.

We chose the **8 Dimensions of Wellness** because it is suited for an RPG format. It breaks wellness down into concrete, actionable domains—like **Financial** and **Environmental**—that translate perfectly into a quest log with measurable data.

Whether we had chosen Ryff, PERMA, or the 8 Dimensions, the requirement that it be able to to move a player "directionally" toward eudaimonia would have been satisfied.

## System Mechanics

The System AI interacts with you through a gamified interface:

*   **Quests:** Actionable tasks categorized by dimension.
*   **Achievements:** Milestones reached through consistent effort.
*   **Physical Integration:** Generate printable cards for your achievements to store in your physical "Loot Box," bridging the digital and physical realms.
*   **The System AI:** An omnipresent guide that tracks your progress and offers "encouragement."

You can "start a game" and choose to play by yourself or with others. The game is meant to be paired with a Physical "Quest Box". You start a game by telling the System AI what your goals are (ChatGPT or similar), and it converts them into "official" quests with difficulty rankings, snarky commentary, pictures, etc.

These quests can be updated by you as you pursue them, earning you achievements. Quests and achievements become cards you can print, sign, and drop in your "Quest Box".

As you complete quests, you gain experience and level up, and your progress is logged on a leaderboard if you are playing with more than one person (say a housemate, sibling, or spouse). 

This is why it's important the "Quest" difficulty and rewards be chosen by a third party. ChatGPT isn't perfect, but it arguably is less biased than you would be assigning your own points and experience, so that's why we include it. It's also much faster to get an LLM to convert a "goal" (like write a book) into a Quest that it is for a person. You may have hundreds of short "goals", a long list that you can convert into quests in seconds and start your season.

You can add quests throughout the season, they aren't fixed. You can work on as many at a time as you want, and as you log updates on them the leaderboard will change to reflect your progress.

While ChatGPT can help assign difficulties and distribute points fairly, you still have to be honest with yourself to get the most out of the game. There's nothing "checking" that you've really accomplished the tasks you've assigned yourself, except to some degree other players at the end of a season, when you all get together and read over what you've completed.

Regardless, work hard and be honest with yourself to get the most out of this game!

A season can be as long or short as you want.

My own friend group has aligned our game season with the start of 2026, and it will run until Dec 31st. Motivation is always high at the beginning of a new year, so it seemed appropriate.

But you could also just play with no time frame in mind, that's totally up to you.

## Character Sheet

When you sign up, a Character sheet is generated for you. It lists your experience and level, your completed quests, active quests, achievemnts, and overall eudaimonai score.

## Eudaimonai Score

To calculate how much you are flourishing - your Eudaimonia Score - we use a "Surface Area" approach. If a user has total XP Xi​ in each of the 8 dimensions, the score should penalize imbalance.

Eudaimonia=(i=1∑8​Xi​)×BalanceFactor

Where the BalanceFactor is the ratio of the lowest dimension's level to the highest. This ensures that a "Pillar of Meat" with zero "Emotional" XP will have a lower score than a well-rounded player with half the total XP.

If your character is part of a game and already had experience, the experience you had going into the game is subtracted out to ensure everyone you are playing with starts at 0.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend:** Python, FastAPI, SQLite, SQLAlchemy
*   **AI:** OpenAI Integration

## 🚀 Initialization

To boot up the System and begin your pursuit:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/eudaimonai.git
    cd eudaimonai
    ```

2.  **Start the System:**
    The `start.sh` script handles everything—setting up the Python virtual environment, installing dependencies (using `uv`), and launching both the frontend and backend.
    ```bash
    ./start.sh
    ```

3.  **Access the Interface:**
    *   **Frontend:** [http://localhost:5173](http://localhost:5173)
    *   **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)

## ⚠️ Warning

The System AI is watching. Neglect your dimensions at your own peril.

---
*Eudaemonia v2.0 - "The Good Life Protocol"*
