import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Achievement, Quest, User, Status } from '../types';
import { LayoutGrid, List, Search, Skull, Edit2, Check, Share2, ExternalLink, X, Circle, Archive, History, Trophy, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuestCard from '../components/QuestCard';
import AchievementCard from '../components/AchievementCard';
import CharacterCard from '../components/CharacterCard';
import CardActionBar from '../components/CardActionBar';
import { QRCodeSVG } from 'qrcode.react';

const Profile: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Status | 'all' | 'achievements'>('active');
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
        
        // Auto-switch to backlog if no active quests
        const active = questsRes.data.filter((q: Quest) => q.status === 'active');
        if (active.length === 0 && questsRes.data.length > 0) {
            setActiveTab('backlog');
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteQuest = async (questId: string) => {
      if (!confirm('Are you sure you want to delete this quest?')) return;
      try {
          await axios.delete(`http://localhost:8000/quests/${questId}`);
          setQuests(quests.filter(q => q.id !== questId));
      } catch (error) {
          console.error("Error deleting quest", error);
      }
  };

  const handleStatusChange = async (questId: string, newStatus: Status) => {
      try {
          await axios.patch(`http://localhost:8000/quests/${questId}`, { status: newStatus });
          setQuests(quests.map(q => q.id === questId ? { ...q, status: newStatus } : q));
          
          // Refresh profile stats if completing
          if (newStatus === 'completed') {
              const profileRes = await axios.get('http://localhost:8000/profile');
              setProfile(profileRes.data);
              updateUser(profileRes.data);
          }
      } catch (error) {
          console.error("Error updating quest status", error);
      }
  };

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

  const handleVisibilityChange = async (id: string, type: 'quest' | 'achievement', newHidden: boolean) => {
    try {
        const endpoint = type === 'quest' ? 'quests' : 'achievements';
        await axios.patch(`http://localhost:8000/${endpoint}/${id}`, { is_hidden: newHidden });
        
        if (type === 'quest') {
            setQuests(quests.map(q => q.id === id ? { ...q, is_hidden: newHidden } : q));
        } else {
            setAchievements(achievements.map(a => a.id === id ? { ...a, is_hidden: newHidden } : a));
        }
    } catch (error) {
        console.error(`Error updating ${type} visibility`, error);
    }
  };

  if (loading || !profile) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading profile...</div>;

  const filteredQuests = quests.filter(q => {
    const matchesTab = activeTab === 'all' ? true : q.status === activeTab;
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (q.dimension || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredAchievements = achievements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.context.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
      { id: 'active', label: 'Active', icon: Circle, color: 'text-orange-500', count: quests.filter(q => q.status === 'active').length },
      { id: 'backlog', label: 'Backlog', icon: Archive, color: 'text-gray-500', count: quests.filter(q => q.status === 'backlog').length },
      { id: 'completed', label: 'History', icon: History, color: 'text-green-500', count: quests.filter(q => q.status === 'completed').length },
      { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'text-yellow-500', count: achievements.length },
      { id: 'all', label: 'All Quests', icon: LayoutGrid, color: 'text-purple-500', count: quests.length },
  ];

  return (
    <div className="space-y-6">
      {/* Character Card Showcase */}
      <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <CharacterCard user={profile} achievements={achievements} />
            <CardActionBar 
                type="character"
                id={profile.username}
                showStatusActions={false}
                showDelete={false}
            />
          </div>
      </div>

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
                        <p className="text-orange-600 dark:text-dcc-system font-mono font-medium">Level {profile.level || 1} Player</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Player
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t dark:border-gray-700/50">
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
                    <div className="text-center md:text-left">
                        <div className="text-2xl font-bold text-orange-600 dark:text-dcc-system">{profile.stats?.total_xp || 0}</div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Total XP</div>
                    </div>
                </div>

                {/* Status Effects (Mocked) */}
                <div className="mt-6 pt-4 border-t dark:border-gray-700/50">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Status Effects</h3>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-3 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <div>
                                <div className="text-xs font-bold text-blue-700 dark:text-blue-300">Momentum x5</div>
                                <div className="text-[10px] text-blue-600 dark:text-blue-400">+10% XP Gain</div>
                            </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded px-3 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <div>
                                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">Well Rested</div>
                                <div className="text-[10px] text-purple-600 dark:text-purple-400">Ready for Quests</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quest Breakdown */}
                {profile.stats?.quest_difficulty_breakdown && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700/50">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quest Mastery</h3>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map(diff => {
                                const count = profile.stats?.quest_difficulty_breakdown?.[diff] || 0;
                                if (count === 0) return null;
                                
                                let label = "Common";
                                let color = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
                                if (diff === 2) { label = "Uncommon"; color = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"; }
                                if (diff === 3) { label = "Rare"; color = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"; }
                                if (diff === 4) { label = "Epic"; color = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"; }
                                if (diff === 5) { label = "Legendary"; color = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"; }

                                return (
                                    <div key={diff} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${color}`}>
                                        <span>{label}</span>
                                        <span className="bg-white/20 px-1.5 rounded-full">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Dimension Stats */}
                {profile.dimension_stats && profile.dimension_stats.length > 0 && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700/50">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Dimension Levels</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {profile.dimension_stats.map(stat => (
                                <div key={stat.dimension} className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">{stat.dimension}</span>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-orange-600 dark:text-dcc-system">Lvl {stat.level}</div>
                                        <div className="text-[10px] text-gray-400">{stat.total_xp} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
        <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg w-full xl:w-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                                ${isActive 
                                    ? 'bg-white dark:bg-dcc-card text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
                            <span>{tab.label}</span>
                            <span className={`
                                text-xs px-1.5 py-0.5 rounded-full
                                ${isActive 
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }
                            `}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search & View Toggle */}
            <div className="flex items-center space-x-4 w-full xl:w-auto justify-end">
                <div className="relative flex-1 sm:flex-none w-full sm:w-64">
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
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shrink-0">
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
        {activeTab === 'achievements' ? (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {filteredAchievements.map(achievement => (
                        <div key={achievement.id} className="flex flex-col gap-4 w-full max-w-sm items-center">
                            <AchievementCard achievement={achievement} />
                            <CardActionBar 
                                type="achievement"
                                id={achievement.id}
                                isHidden={achievement.is_hidden}
                                onVisibilityChange={(hidden) => handleVisibilityChange(achievement.id, 'achievement', hidden)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Achievement</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAchievements.map((achievement) => (
                                <tr key={achievement.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{achievement.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{achievement.ai_description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(achievement.date_completed).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {achievement.context}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        ) : (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {filteredQuests.map(quest => (
                        <div key={quest.id} className="flex flex-col gap-4 w-full max-w-sm items-center">
                            <QuestCard 
                                quest={quest} 
                                username={profile?.display_name || profile?.username}
                                className={quest.is_hidden ? 'opacity-60 grayscale' : ''} 
                            />
                            <CardActionBar 
                                type="quest"
                                id={quest.id}
                                status={quest.status}
                                isHidden={quest.is_hidden}
                                onStatusChange={(status) => handleStatusChange(quest.id, status)}
                                onDelete={() => handleDeleteQuest(quest.id)}
                                onVisibilityChange={(hidden) => handleVisibilityChange(quest.id, 'quest', hidden)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quest</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimension</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuests.map((quest) => (
                                <tr key={quest.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{quest.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{quest.victory_condition}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {quest.dimension}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${quest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                              quest.status === 'active' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
                                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {quest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <CardActionBar 
                                                type="quest"
                                                id={quest.id}
                                                status={quest.status}
                                                isHidden={quest.is_hidden}
                                                onStatusChange={(status) => handleStatusChange(quest.id, status)}
                                                onDelete={() => handleDeleteQuest(quest.id)}
                                                onVisibilityChange={(hidden) => handleVisibilityChange(quest.id, 'quest', hidden)}
                                            />
                                        </div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Player</h3>
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
