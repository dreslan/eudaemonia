import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import type { Achievement, Quest } from '../types';
import { ArrowLeft, Printer, Link as LinkIcon, Save, Share2, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AchievementCard from '../components/AchievementCard';

const AchievementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [linkedQuest, setLinkedQuest] = useState<Quest | null>(null);
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
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
            try {
                const questUrl = isPublic
                    ? `http://localhost:8000/public/quests/${achRes.data.quest_id}`
                    : `http://localhost:8000/quests/${achRes.data.quest_id}`;
                
                const questRes = await axios.get(questUrl);
                setLinkedQuest(questRes.data);
            } catch (qError) {
                console.log("Could not fetch linked quest", qError);
            }
        } else if (!isPublic) {
            // Fetch available quests for linking
            try {
                const questsRes = await axios.get('http://localhost:8000/quests');
                setAvailableQuests(questsRes.data.filter((q: Quest) => q.status !== 'completed'));
            } catch (qError) {
                console.log("Could not fetch quests list", qError);
            }
        }
      } catch (error) {
        console.error("Error fetching achievement details", error);
      }
    };
    fetchData();
  }, [id, isPublic]);

  const handlePrint = () => {
    if (achievement) {
        window.open(`/print/achievements/${achievement.id}`, '_blank');
    }
  };

  const handleShare = () => {
      if (achievement) {
          const url = `${window.location.origin}/public/achievement/${achievement.id}`;
          navigator.clipboard.writeText(url);
          alert("Public link copied to clipboard!");
      }
  };

  const handleManage = () => {
      if (!user) {
          navigate('/login', { state: { from: location } });
          return;
      }
      
      if (achievement && user.id === achievement.user_id) {
          navigate(`/achievements/${id}`);
      } else {
          alert("You do not have permission to manage this achievement.");
      }
  };

  const handleLinkQuest = async () => {
      if (!selectedQuestId || !achievement) return;
      
      try {
          await axios.patch(`http://localhost:8000/achievements/${achievement.id}`, {
              quest_id: selectedQuestId
          });
          
          // Refresh data
          const quest = availableQuests.find(q => q.id === selectedQuestId);
          if (quest) {
              setLinkedQuest(quest);
              setAchievement({ ...achievement, quest_id: selectedQuestId });
          }
      } catch (error) {
          console.error("Error linking quest", error);
          alert("Failed to link quest. Please try again.");
      }
  };

  if (!achievement) return <div className="text-center p-10 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col items-center min-h-screen">
      <div className="w-full flex justify-between mb-8">
          {!isPublic ? (
            <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
          ) : (
             <div className="flex items-center gap-4">
                 <button onClick={() => window.history.back()} className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                 </button>
                 <button
                    onClick={handleManage}
                    className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-900/50"
                >
                    <Settings className="w-3 h-3 mr-1" /> Manage
                </button>
             </div>
          )}
          
          <div className="flex gap-2">
            {!isPublic && (
                <button 
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors shadow-lg"
                >
                    <Share2 className="w-5 h-5 mr-2" /> Share
                </button>
            )}
            <button 
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded transition-colors shadow-lg"
            >
                <Printer className="w-5 h-5 mr-2" /> Print Card
            </button>
          </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12 items-center justify-center mt-4">
        <div className="transform scale-100 sm:scale-110">
            <AchievementCard 
                achievement={achievement} 
                questTitle={linkedQuest?.title}
                username={!isPublic ? (user?.display_name || user?.username) : undefined}
                forceFace="front"
            />
        </div>
        <div className="transform scale-100 sm:scale-110">
            <AchievementCard 
                achievement={achievement} 
                questTitle={linkedQuest?.title}
                username={!isPublic ? (user?.display_name || user?.username) : undefined}
                forceFace="back"
            />
        </div>
      </div>

      {/* Quest Linking Section */}
      <div className="w-full max-w-2xl mt-16 p-6 bg-white dark:bg-dcc-card rounded-lg shadow-lg border dark:border-dcc-system/20">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2 text-dcc-system" />
              Quest Association
          </h3>
          
          {linkedQuest ? (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">Linked to Quest</span>
                      <Link to={isPublic ? `/public/quests/${linkedQuest.id}` : `/quests/${linkedQuest.id}`} className="text-lg font-medium text-orange-600 dark:text-dcc-system hover:underline">
                          {linkedQuest.title}
                      </Link>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-bold uppercase rounded-full">
                      Linked
                  </div>
              </div>
          ) : !isPublic ? (
              <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      This achievement is not linked to any quest. You can link it to an existing quest below.
                  </p>
                  <div className="flex gap-4">
                      <select
                          value={selectedQuestId}
                          onChange={(e) => setSelectedQuestId(e.target.value)}
                          className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      >
                          <option value="">Select a quest...</option>
                          {availableQuests.map(q => (
                              <option key={q.id} value={q.id}>
                                  {q.title} ({q.status})
                              </option>
                          ))}
                      </select>
                      <button
                          onClick={handleLinkQuest}
                          disabled={!selectedQuestId}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dcc-system hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <Save className="w-4 h-4 mr-2" />
                          Link Quest
                      </button>
                  </div>
              </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 italic">
                No quest linked.
            </div>
          )}
      </div>
    </div>
  );
};

export default AchievementDetail;
