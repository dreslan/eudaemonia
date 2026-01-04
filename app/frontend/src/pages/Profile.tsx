import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Achievement, Quest, User } from '../types';
import { LayoutGrid, List, Search, Eye, EyeOff, Skull, Edit2, Check, Share2, ExternalLink, X, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuestCard from '../components/QuestCard';
import AchievementCard from '../components/AchievementCard';
import DimensionBadge from '../components/DimensionBadge';
import { QRCodeSVG } from 'qrcode.react';

const Profile: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [curatorTab, setCuratorTab] = useState<'quests' | 'achievements'>('quests');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const baseUrl = window.location.origin;
  const publicProfileUrl = `${baseUrl}/public/profile/${profile?.username}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, questsRes, achievementsRes] = await Promise.all([
            axios.get('http://localhost:8000/profile'),
            axios.get('http://localhost:8000/quests'),
            axios.get('http://localhost:8000/achievements')
        ]);
        setProfile(profileRes.data);
        setDisplayName(profileRes.data.display_name || profileRes.data.username);
        setQuests(questsRes.data);
        setAchievements(achievementsRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    try {
      const res = await axios.put('http://localhost:8000/profile', { 
          display_name: displayName
      });
      const updatedProfile: User = { 
          ...profile, 
          display_name: res.data.display_name
      };
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  const toggleQuestVisibility = async (e: React.MouseEvent, quest: Quest) => {
    e.preventDefault(); // Prevent navigation
    try {
        const updatedQuest = { ...quest, is_hidden: !quest.is_hidden };
        await axios.patch(`http://localhost:8000/quests/${quest.id}`, { is_hidden: updatedQuest.is_hidden });
        setQuests(quests.map(q => q.id === quest.id ? updatedQuest : q));
    } catch (error) {
        console.error("Error updating quest visibility", error);
    }
  };

  const toggleAchievementVisibility = async (e: React.MouseEvent, achievement: Achievement) => {
    e.preventDefault(); // Prevent navigation
    try {
        const updatedAchievement = { ...achievement, is_hidden: !achievement.is_hidden };
        await axios.patch(`http://localhost:8000/achievements/${achievement.id}`, { is_hidden: updatedAchievement.is_hidden });
        setAchievements(achievements.map(a => a.id === achievement.id ? updatedAchievement : a));
    } catch (error) {
        console.error("Error updating achievement visibility", error);
    }
  };

  if (loading || !profile) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading profile...</div>;

  const filteredQuests = quests.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (q.dimension || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredAchievements = achievements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.context.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Character Sheet Header */}
      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 dark:text-dcc-system border-4 border-white dark:border-dcc-card shadow-lg">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow text-center md:text-left space-y-2 w-full">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                    <div>
                        {isEditingProfile ? (
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <input 
                                    type="text" 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="border dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white bg-white dark:bg-gray-900 font-bold text-xl"
                                    placeholder="Display Name"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleUpdateProfile} className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-700">
                                        <Check className="w-3 h-3" /> Save
                                    </button>
                                    <button onClick={() => { setIsEditingProfile(false); setDisplayName(profile.display_name || profile.username); }} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.display_name || profile.username}</h1>
                                <button onClick={() => setIsEditingProfile(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-orange-600 dark:text-dcc-system font-mono font-medium">Level {profile.level || 1} Crawler</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Character
                        </button>
                        <a 
                            href={publicProfileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-dcc-system text-white rounded-md text-sm font-medium hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Public View
                        </a>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t dark:border-gray-700/50">
                    <div className="text-center md:text-left">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.quests_active || 0}</div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Active Quests</div>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.quests_completed || 0}</div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Completed</div>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.achievements_unlocked || 0}</div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Achievements</div>
                    </div>
                </div>
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
                    Pathetic Display
                </h1>
                
                <div className="space-y-4 max-w-xl">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Is this your profile? Really? <span className="text-red-600 dark:text-red-400 italic">Embarrassing</span>.
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        You have nothing to show. No quests. No achievements. Just a blank page staring back at you.
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Go do something. Anything. Before I delete your account out of pity.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link to="/quests/new" className="px-6 py-3 bg-dcc-system text-white dark:text-black font-bold text-base uppercase tracking-wider rounded hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors shadow-md">
                        Start Quest
                    </Link>
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
                    onClick={() => setCuratorTab('quests')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${curatorTab === 'quests' ? 'bg-white dark:bg-dcc-card text-orange-600 dark:text-dcc-system shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Quests
                </button>
                <button
                    onClick={() => setCuratorTab('achievements')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${curatorTab === 'achievements' ? 'bg-white dark:bg-dcc-card text-orange-600 dark:text-dcc-system shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
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
        {curatorTab === 'quests' && (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {filteredQuests.map(quest => (
                        <div key={quest.id} className="relative group">
                            <QuestCard 
                                quest={quest} 
                                username={profile?.display_name || profile?.username}
                                className={quest.is_hidden ? 'opacity-60 grayscale' : ''} 
                                onVisibilityChange={(isHidden: boolean) => {
                                    setQuests(quests.map(q => q.id === quest.id ? { ...q, is_hidden: isHidden } : q));
                                }}
                            />
                            <div className="absolute top-2 right-2 z-20">
                                <button
                                    onClick={(e) => toggleQuestVisibility(e, quest)}
                                    className={`p-2 rounded-full shadow-lg border transition-all ${
                                        quest.is_hidden 
                                        ? 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white' 
                                        : 'bg-white text-green-600 border-green-200 hover:text-green-700'
                                    }`}
                                    title={quest.is_hidden ? "Hidden from public" : "Visible to public"}
                                >
                                    {quest.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
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
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visibility</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dcc-card divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuests.map(quest => (
                                <tr key={quest.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${quest.is_hidden ? 'opacity-75' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/quests/${quest.id}`} className="text-orange-600 dark:text-dcc-system hover:underline font-medium">
                                            {quest.title}
                                        </Link>
                                        {quest.is_hidden && <span className="ml-2 text-xs text-gray-400">(Hidden)</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                            {quest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <DimensionBadge dimension={quest.dimension} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {quest.victory_condition}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => toggleQuestVisibility(e, quest)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title={quest.is_hidden ? "Show on public profile" : "Hide from public profile"}
                                        >
                                            {quest.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        )}

        {curatorTab === 'achievements' && (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {filteredAchievements.map((ach: Achievement) => (
                        <div key={ach.id} className="relative group">
                            <AchievementCard 
                                achievement={ach} 
                                username={profile?.display_name || profile?.username}
                                questTitle={quests.find(q => q.id === ach.quest_id)?.title}
                                className={ach.is_hidden ? 'opacity-60 grayscale' : ''} 
                                onVisibilityChange={(isHidden: boolean) => {
                                    setAchievements(achievements.map(a => a.id === ach.id ? { ...a, is_hidden: isHidden } : a));
                                }}
                            />
                            <div className="absolute top-2 right-2 z-20">
                                <button
                                    onClick={(e) => toggleAchievementVisibility(e, ach)}
                                    className={`p-2 rounded-full shadow-lg border transition-all ${
                                        ach.is_hidden 
                                        ? 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white' 
                                        : 'bg-white text-green-600 border-green-200 hover:text-green-700'
                                    }`}
                                    title={ach.is_hidden ? "Hidden from public" : "Visible to public"}
                                >
                                    {ach.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visibility</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dcc-card divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAchievements.map(ach => (
                                <tr key={ach.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${ach.is_hidden ? 'opacity-75' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/achievements/${ach.id}`} className="text-orange-600 dark:text-dcc-system hover:underline font-bold">
                                            {ach.title}
                                        </Link>
                                        {ach.is_hidden && <span className="ml-2 text-xs text-gray-400">(Hidden)</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {new Date(ach.date_completed).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {ach.context}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => toggleAchievementVisibility(e, ach)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title={ach.is_hidden ? "Show on public profile" : "Hide from public profile"}
                                        >
                                            {ach.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dcc-card rounded-xl shadow-2xl max-w-sm w-full p-6 relative border dark:border-gray-700">
                <button 
                    onClick={() => setShowShareModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Character</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Scan this code to view {profile.display_name || profile.username}'s public profile.
                    </p>
                    
                    <div className="bg-white p-4 rounded-lg shadow-inner inline-block border dark:border-gray-200">
                        <QRCodeSVG value={publicProfileUrl} size={200} />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm font-mono text-gray-600 dark:text-gray-300 break-all">
                        <span className="truncate">{publicProfileUrl}</span>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(publicProfileUrl);
                                alert("Copied to clipboard!");
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Copy URL"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
