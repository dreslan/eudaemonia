import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import QuestCard from '../components/QuestCard';
import AchievementCard from '../components/AchievementCard';
import CharacterCard from '../components/CharacterCard';
import { useAuth } from '../context/AuthContext';
import type { Quest, Achievement, User } from '../types';

const PrintView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { user } = useAuth();
    
    let type = 'quest';
    if (location.pathname.includes('achievements')) type = 'achievement';
    if (location.pathname.includes('character')) type = 'character';
    
    const [data, setData] = useState<Quest | Achievement | User | null>(null);
    const [linkedQuest, setLinkedQuest] = useState<Quest | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (type === 'character') {
                    // For now, just use the logged-in user. 
                    // In a real app, we might fetch by ID if public profiles exist.
                    if (user) setData(user);
                    return;
                }

                const endpoint = type === 'quest' ? 'quests' : 'achievements';
                const res = await axios.get(`http://localhost:8000/${endpoint}/${id}`);
                setData(res.data);

                if (type === 'achievement' && res.data.quest_id) {
                    try {
                        const questRes = await axios.get(`http://localhost:8000/quests/${res.data.quest_id}`);
                        setLinkedQuest(questRes.data);
                    } catch (qError) {
                        console.log("Could not fetch linked quest for print", qError);
                    }
                }
            } catch (error) {
                console.error("Error fetching data for print", error);
            }
        };
        fetchData();
    }, [id, type]);

    useEffect(() => {
        if (data) {
            // Small delay to ensure rendering then print
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [data]);

    if (!data) return <div className="text-center p-10">Loading for print...</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 print:p-0 print:bg-transparent relative">
            <div className="absolute top-8 print:hidden text-gray-400 text-xs uppercase tracking-widest animate-pulse">
                Preparing Print Preview...
            </div>
            <div className="print:scale-100 transform scale-125">
                {type === 'quest' ? (
                    <div className="flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-center">
                        <QuestCard 
                            quest={data as Quest} 
                            username={user?.display_name || user?.username}
                            forceFace="front"
                        />
                        <QuestCard 
                            quest={data as Quest} 
                            username={user?.display_name || user?.username}
                            forceFace="back"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-center">
                        <AchievementCard 
                            achievement={data as Achievement} 
                            username={user?.display_name || user?.username}
                            questTitle={linkedQuest?.title}
                            forceFace="front"
                        />
                        <AchievementCard 
                            achievement={data as Achievement} 
                            username={user?.display_name || user?.username}
                            questTitle={linkedQuest?.title}
                            forceFace="back"
                        />
                    </div>
                )}
                {type === 'character' && (
                    <div className="flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-center">
                        <CharacterCard 
                            user={data as User} 
                            forceFace="front"
                        />
                        <CharacterCard 
                            user={data as User} 
                            forceFace="back"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrintView;