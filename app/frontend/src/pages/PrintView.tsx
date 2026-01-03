import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import QuestCard from '../components/QuestCard';
import AchievementCard from '../components/AchievementCard';
import { useAuth } from '../context/AuthContext';
import type { Quest, Achievement } from '../types';

const PrintView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { user } = useAuth();
    const type = location.pathname.includes('quests') ? 'quest' : 'achievement';
    
    const [data, setData] = useState<Quest | Achievement | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = type === 'quest' ? 'quests' : 'achievements';
                const res = await axios.get(`http://localhost:8000/${endpoint}/${id}`);
                setData(res.data);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 print:p-0 print:bg-transparent">
            <div className="print:scale-100 transform scale-125">
                {type === 'quest' ? (
                    <div className="flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-center">
                        <QuestCard 
                            quest={data as Quest} 
                            forceFace="front"
                            hideActions={true}
                        />
                        <QuestCard 
                            quest={data as Quest} 
                            forceFace="back"
                            hideActions={true}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-center">
                        <AchievementCard 
                            achievement={data as Achievement} 
                            username={user?.display_name || user?.username}
                            forceFace="front"
                        />
                        <AchievementCard 
                            achievement={data as Achievement} 
                            username={user?.display_name || user?.username}
                            forceFace="back"
                        />
                    </div>
                )}
            </div>
            <div className="mt-8 print:hidden text-gray-500 text-sm">
                Printing should start automatically...
            </div>
        </div>
    );
};

export default PrintView;