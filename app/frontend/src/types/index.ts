export type Dimension = 'intellectual' | 'physical' | 'financial' | 'environmental' | 'vocational' | 'social' | 'emotional' | 'spiritual';
export type Status = 'active' | 'backlog' | 'maybe' | 'completed';

export interface Quest {
    id: string;
    title: string;
    dimension: Dimension;
    status: Status;
    tags: string[];
    created_at: string;
    progress: number;
    victory_condition?: string;
    is_hidden?: boolean;
}

export interface QuestCreate {
    title: string;
    dimension: Dimension;
    status?: Status;
    tags?: string[];
    victory_condition?: string;
}

export interface Achievement {
    id: string;
    title: string;
    context: string;
    date_completed: string;
    dimension: Dimension;
    image_url?: string;
    ai_description?: string;
    ai_reward?: string;
    quest_id?: string;
    is_hidden?: boolean;
}

export interface AchievementCreate {
    title: string;
    context: string;
    date_completed: string;
    dimension: Dimension;
    image_url?: string;
    ai_description?: string;
    ai_reward?: string;
    quest_id?: string;
}
