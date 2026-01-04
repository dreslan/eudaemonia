import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Achievement, Quest } from '../types';
import { LayoutGrid, List, Search, Eye, EyeOff, Skull, Edit2, Check, Printer, Download, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuestCard from '../components/QuestCard';
import AchievementCard from '../components/AchievementCard';
import { QRCodeSVG } from 'qrcode.react';

const Profile: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements' | 'settings'>('quests');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [apiKey, setApiKey] = useState('');

  const baseUrl = window.location.origin;
  const newQuestUrl = `${baseUrl}/quests/new`;
  const newAchievementUrl = `${baseUrl}/achievements/new`;

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
        setApiKey(profileRes.data.openai_api_key || '');
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
    try {
      const res = await axios.put('http://localhost:8000/profile', { 
          display_name: displayName,
          openai_api_key: apiKey
      });
      const updatedProfile = { 
          ...profile, 
          display_name: res.data.display_name,
          openai_api_key: res.data.openai_api_key
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

  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (q.dimension || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        
        <div className="flex items-center justify-center gap-2 mb-1">
            {isEditingProfile ? (
                <div className="flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 text-left">Display Name</label>
                        <input 
                            type="text" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full border dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                            placeholder="Display Name"
                        />
                    </div>
                    <div className="flex gap-2 mt-2 w-full justify-end">
                        <button onClick={() => { setIsEditingProfile(false); setDisplayName(profile.display_name || profile.username); }} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded text-sm">
                            Cancel
                        </button>
                        <button onClick={handleUpdateProfile} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center gap-1 text-sm shadow-sm">
                            <Check className="w-3 h-3" /> Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.display_name || profile.username}</h1>
                        <button onClick={() => setIsEditingProfile(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                    {profile.display_name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
                    )}
                </div>
            )}
        </div>
        
        <p className="text-gray-500 dark:text-gray-400">Level {profile.level} Crawler</p>
        
        <div className="mt-4">
            <Link to={`/public/${profile.username}`} className="text-sm text-orange-600 dark:text-dcc-system hover:underline flex items-center justify-center gap-1">
                View Public Profile
            </Link>
        </div>
        
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
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white dark:bg-dcc-card text-orange-600 dark:text-dcc-system shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Settings & Tools
                </button>
            </div>

            {/* Search & View Toggle */}
            {activeTab !== 'settings' && (
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
            )}
        </div>

        {/* Content */}
        {activeTab === 'quests' && (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {filteredQuests.map(quest => (
                        <div key={quest.id} className="relative group">
                            <QuestCard 
                                quest={quest} 
                                username={profile?.display_name || profile?.username}
                                className={quest.is_hidden ? 'opacity-75' : ''} 
                            />
                            <button
                                onClick={(e) => toggleQuestVisibility(e, quest)}
                                className="absolute top-2 right-2 z-20 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-gray-700"
                                title={quest.is_hidden ? "Show on public profile" : "Hide from public profile"}
                            >
                                {quest.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                                        {quest.dimension}
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

        {activeTab === 'achievements' && (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {filteredAchievements.map((ach: Achievement) => (
                        <div key={ach.id} className="relative group">
                            <AchievementCard 
                                achievement={ach} 
                                username={profile?.display_name || profile?.username}
                                className={ach.is_hidden ? 'opacity-75' : ''} 
                            />
                            <button
                                onClick={(e) => toggleAchievementVisibility(e, ach)}
                                className="absolute top-2 right-2 z-20 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-gray-700"
                                title={ach.is_hidden ? "Show on public profile" : "Hide from public profile"}
                            >
                                {ach.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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

        {activeTab === 'settings' && (
            <div className="space-y-8">
                {/* QR Codes Section */}
                <div className="bg-white dark:bg-dcc-card rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold dark:text-dcc-system flex items-center gap-2">
                                <Printer className="w-5 h-5" /> QR Codes
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Print these QR codes and attach them to your physical achievement box for quick access.</p>
                        </div>
                        <button 
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center gap-2 print:hidden"
                        >
                            <Printer className="w-4 h-4" />
                            Print QR Codes
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <h3 className="text-lg font-bold mb-4 text-orange-600 dark:text-dcc-system">New Quest</h3>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <QRCodeSVG value={newQuestUrl} size={160} />
                            </div>
                            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-mono break-all text-center">{newQuestUrl}</p>
                        </div>

                        <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <h3 className="text-lg font-bold mb-4 text-green-600 dark:text-green-400">New Achievement</h3>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <QRCodeSVG value={newAchievementUrl} size={160} />
                            </div>
                            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-mono break-all text-center">{newAchievementUrl}</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* GenAI Settings */}
                <div className="bg-white dark:bg-dcc-card rounded-lg">
                    <h2 className="text-xl font-bold mb-4 dark:text-dcc-system flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> GenAI Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Configure your OpenAI API key to enable AI-generated flavor text for achievements.</p>
                    
                    <div className="max-w-xl">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OpenAI API Key</label>
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                className="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-sm font-mono"
                                placeholder="sk-..."
                            />
                            <button 
                                onClick={handleUpdateProfile}
                                className="px-4 py-2 bg-dcc-system text-white rounded hover:bg-orange-700 dark:hover:bg-orange-400 text-sm font-medium shadow-sm"
                            >
                                Save Key
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Your key is stored securely in your local database and is only used for generating descriptions.
                        </p>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Privacy Settings */}
                <div className="bg-white dark:bg-dcc-card rounded-lg">
                    <h2 className="text-xl font-bold mb-4 dark:text-dcc-system flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Privacy Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Manage the visibility of your quests and achievements on your public profile.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border dark:border-gray-700 rounded-lg">
                            <h3 className="font-semibold mb-3 dark:text-white">Quests</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={async () => {
                                        if(window.confirm("Hide all quests from public profile?")) {
                                            await axios.post('http://localhost:8000/quests/bulk-visibility', { is_hidden: true });
                                            alert("All quests hidden.");
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm flex-1"
                                >
                                    Hide All
                                </button>
                                <button 
                                    onClick={async () => {
                                        if(window.confirm("Show all quests on public profile?")) {
                                            await axios.post('http://localhost:8000/quests/bulk-visibility', { is_hidden: false });
                                            alert("All quests visible.");
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm flex-1"
                                >
                                    Show All
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border dark:border-gray-700 rounded-lg">
                            <h3 className="font-semibold mb-3 dark:text-white">Achievements</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={async () => {
                                        if(window.confirm("Hide all achievements from public profile?")) {
                                            await axios.post('http://localhost:8000/achievements/bulk-visibility', { is_hidden: true });
                                            alert("All achievements hidden.");
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm flex-1"
                                >
                                    Hide All
                                </button>
                                <button 
                                    onClick={async () => {
                                        if(window.confirm("Show all achievements on public profile?")) {
                                            await axios.post('http://localhost:8000/achievements/bulk-visibility', { is_hidden: false });
                                            alert("All achievements visible.");
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm flex-1"
                                >
                                    Show All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Data Export */}
                <div className="bg-white dark:bg-dcc-card rounded-lg">
                    <h2 className="text-xl font-bold mb-4 dark:text-dcc-system flex items-center gap-2">
                        <Download className="w-5 h-5" /> Data Export
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Download a copy of all your data.</p>
                    <button 
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 dark:bg-dcc-system dark:text-black dark:hover:bg-orange-400 flex items-center gap-2 text-sm"
                        onClick={() => {
                            window.open('http://localhost:8000/quests', '_blank');
                        }}
                    >
                        <Download className="w-4 h-4" /> Download Quests JSON
                    </button>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-900/30">
                    <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                        <Skull className="w-5 h-5" /> Danger Zone
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Permanently delete all quests and achievements. This cannot be undone.</p>
                    <button 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-sm shadow-sm"
                        onClick={async () => {
                            if (window.confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
                                try {
                                    await axios.post('http://localhost:8000/reset');
                                    alert("Data reset successfully.");
                                    window.location.reload();
                                } catch (error) {
                                    console.error("Error resetting data:", error);
                                    alert("Error resetting data.");
                                }
                            }
                        }}
                    >
                        Reset All Data
                    </button>
                </div>
            </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Profile;
