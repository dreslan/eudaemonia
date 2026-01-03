import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import type { Achievement, Quest } from '../types';
import { LayoutGrid, List, Search, Skull } from 'lucide-react';

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/public/profile/${username}`);
        setProfile(res.data);
        setQuests(res.data.quests);
        setAchievements(res.data.achievements || res.data.recent_achievements);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchData();
  }, [username]);

  if (loading || !profile) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading profile...</div>;

  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.dimension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAchievements = achievements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.context.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 text-center border dark:border-dcc-system/20">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/50 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-orange-600 dark:text-dcc-system mb-4">
          {(profile.display_name || profile.username).charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.display_name || profile.username}</h1>
        {profile.display_name && <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>}
        <p className="text-gray-500 dark:text-gray-400 mt-1">Level {profile.level} Adventurer</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6 border-t dark:border-gray-700 pt-6">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.quests_active}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Quests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.quests_completed}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.achievements_unlocked}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Achievements</div>
          </div>
        </div>
      </div>

      {quests.length === 0 && achievements.length === 0 ? (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-dcc-card text-gray-900 dark:text-white rounded-xl border-2 border-dcc-system shadow-xl relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full shadow-sm">
                    <Skull className="w-12 h-12 text-red-600 dark:text-red-500" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-dcc-system">
                    Nothing to See Here
                </h1>
                
                <div className="space-y-4 max-w-xl">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        This crawler is absolutely <span className="text-red-600 dark:text-red-400 italic">useless</span>.
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        They have achieved nothing. They have completed nothing. They are a waste of server space.
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Move along. Find someone who actually plays the game.
                    </p>
                </div>
            </div>
        </div>
      ) : (
      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20">
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('quests')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'quests' ? 'bg-white dark:bg-dcc-card text-orange-600 dark:text-dcc-system shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Quests
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'achievements' ? 'bg-white dark:bg-dcc-card text-orange-600 dark:text-dcc-system shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Achievements
                </button>
            </div>

            {/* Search & View Toggle */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-dcc-system' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-r-md ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-dcc-system' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Content */}
        {activeTab === 'quests' ? (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuests.map(quest => (
                        <div key={quest.id} className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border dark:border-gray-700 p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{quest.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${quest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                    {quest.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{quest.victory_condition}</p>
                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded">
                                    {quest.dimension}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimension</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Victory Condition</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dcc-card divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuests.map(quest => (
                                <tr key={quest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-orange-600 dark:text-dcc-system font-medium">
                                            {quest.title}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                            {quest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {quest.dimension}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {quest.victory_condition}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        ) : (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map((ach: Achievement) => (
                        <Link to={`/public/achievement/${ach.id}`} key={ach.id} className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-400 dark:border-dcc-gold group cursor-pointer">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                            {ach.image_url && <img src={ach.image_url} alt={ach.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />}
                            <div className="absolute top-0 right-0 bg-yellow-400 dark:bg-dcc-gold text-xs font-bold px-2 py-1 uppercase tracking-wider text-yellow-900 dark:text-black transform rotate-0">
                                Unlocked
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-black text-lg mb-1 text-gray-900 dark:text-white uppercase tracking-wide">{ach.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">{new Date(ach.date_completed).toLocaleDateString()} {new Date(ach.date_completed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 italic border-l-2 border-gray-200 dark:border-gray-600 pl-2">"{ach.ai_description || ach.context}"</p>
                        </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dcc-card divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAchievements.map(ach => (
                                <tr key={ach.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/public/achievement/${ach.id}`} className="text-orange-600 dark:text-dcc-system font-bold hover:underline">
                                            {ach.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {new Date(ach.date_completed).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {ach.context}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        )}
      </div>
      )}
    </div>
  );
};

export default PublicProfile;
