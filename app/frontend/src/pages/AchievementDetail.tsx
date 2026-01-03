import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import type { Achievement, Quest } from '../types';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const AchievementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [linkedQuest, setLinkedQuest] = useState<Quest | null>(null);
  const [showAiSide, setShowAiSide] = useState(false);
  const isPublic = window.location.pathname.startsWith('/public');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = isPublic 
            ? `http://localhost:8000/public/achievements/${id}`
            : `http://localhost:8000/achievements/${id}`;
            
        const achRes = await axios.get(url);
        setAchievement(achRes.data);

        if (achRes.data.quest_id) {
            // For public view, we might need a public quest endpoint too if we want to show quest details.
            // But for now, let's try fetching. If it fails (401), we just won't show the quest.
            // Or we can add a public quest endpoint.
            // Let's assume for now we only show quest info if we can fetch it.
            try {
                const questUrl = isPublic
                    ? `http://localhost:8000/public/quests/${achRes.data.quest_id}` // We need to add this if we want it to work
                    : `http://localhost:8000/quests/${achRes.data.quest_id}`;
                
                // Note: We haven't added /public/quests/:id yet. 
                // So this might fail for public. 
                // Let's skip quest fetching for public for now unless we add the endpoint.
                if (!isPublic) {
                    const questRes = await axios.get(questUrl);
                    setLinkedQuest(questRes.data);
                }
            } catch (qError) {
                console.log("Could not fetch linked quest", qError);
            }
        }
      } catch (error) {
        console.error("Error fetching achievement details", error);
      }
    };
    fetchData();
  }, [id, isPublic]);

  if (!achievement) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!isPublic && (
        <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-dcc-system dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      )}
      {isPublic && (
         <button onClick={() => window.history.back()} className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-dcc-system dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
         </button>
      )}

      <div 
        onClick={() => setShowAiSide(!showAiSide)}
        className="cursor-pointer h-[600px] w-full relative group"
        style={{ perspective: '1000px' }}
      >
        <div 
            className="relative w-full h-full transition-transform duration-700"
            style={{ 
                transformStyle: 'preserve-3d',
                transform: showAiSide ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
        >
            {/* Front (User Side) */}
            <div 
                className="absolute inset-0 w-full h-full bg-white dark:bg-dcc-card shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
                style={{ backfaceVisibility: 'hidden' }}
            >
                <div className="h-64 bg-gray-200 dark:bg-gray-700 relative flex-shrink-0">
                    {achievement.image_url && (
                        <img src={achievement.image_url} alt={achievement.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <h1 className="text-3xl font-bold text-white">{achievement.title}</h1>
                        <p className="text-white/80 text-sm">
                            {new Date(achievement.date_completed).toLocaleDateString()} {new Date(achievement.date_completed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6 flex-1">
                        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Context</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">{achievement.context}</p>
                    </div>

                    {linkedQuest && (
                        <div className="mt-auto pt-6 border-t dark:border-gray-700">
                            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Origin Quest</h2>
                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-bold text-orange-600 dark:text-dcc-system">{linkedQuest.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{linkedQuest.dimension}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">Click to see what the AI had to say</div>
                </div>
            </div>

            {/* Back (AI Side) */}
            <div 
                className="absolute inset-0 w-full h-full bg-gray-900 dark:bg-black rounded-xl shadow-xl border-4 border-yellow-500 dark:border-dcc-gold flex flex-col"
                style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                }}
            >
                <div className="bg-yellow-500 dark:bg-dcc-gold text-black font-black text-center py-4 uppercase tracking-widest text-xl animate-pulse">
                    New Achievement!
                </div>
                
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-8 overflow-hidden">
                    {achievement.image_url && (
                        <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden shadow-2xl flex-shrink-0">
                            <img src={achievement.image_url} alt="Icon" className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <div className="overflow-y-auto max-h-full">
                        <p className="text-yellow-400 font-bold italic text-2xl leading-relaxed">
                            "{achievement.ai_description}"
                        </p>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 text-center border-t border-gray-700">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Reward</p>
                    <p className="text-white text-lg font-medium">{achievement.ai_reward}</p>
                </div>
                
                <div className="p-2 text-center text-xs text-gray-600">Click to flip back</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementDetail;
