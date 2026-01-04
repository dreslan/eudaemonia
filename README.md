# EudaimonAI

> *"Happiness depends upon ourselves."* — Aristotle

**EudaimonAI** is an RPG life-management system designed to guide you toward [https://en.wikipedia.org/wiki/Eudaimonia](eudaimonia)—a state of flourishing and well-being. Powered by the "System AI," this application gamifies your personal growth across **8 Dimensions of Wellness**, turning the chaos of daily life into a structured, meaningful pursuit.

## 🧠 The Philosophy

EudaimonAI is built upon the **8 Dimensions of Wellness** framework to wellness [described in the literature](https://scholar.google.com/citations?view_op=view_citation&hl=en&user=7hbXhs0AAAAJ&citation_for_view=7hbXhs0AAAAJ:iH-uZ7U-co4C) by [https://scholar.google.com/citations?user=7hbXhs0AAAAJ&hl=en](Margaret Swarbrick) and others. The System AI analyzes your activities and helps you maintain balance, ensuring you don't max out one stat while neglecting others.

### The 8 Dimensions
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
- **Seligman’s PERMA** model. 

The thing is, all of these frameworks aim to move the user towards the same distination: holistic flourishing.

We chose the **8 Dimensions of Wellness** because it is suited for an RPG format. Unlike purely psychological models, it treats your "character" as an inhabitant of a physical world, not just a mind in a vacuum. It breaks wellness down into concrete, actionable domains—like **Financial** and **Environmental**—that translate perfectly into a quest log with measurable data.

Whether we had chosen Ryff, PERMA, or the 8 Dimensions, the goal to move "directionally" toward eudaimonia would have been satisfied.

## 🎮 System Mechanics

The System AI interacts with you through a gamified interface:

*   **Quests:** Actionable tasks categorized by dimension.
*   **Achievements:** Milestones reached through consistent effort.
*   **Physical Integration:** Generate printable cards for your achievements to store in your physical "Loot Box," bridging the digital and physical realms.
*   **The System AI:** An omnipresent guide that tracks your progress and offers "encouragement."

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
*EudaimonAI v2.0 - "The Good Life Protocol"*
