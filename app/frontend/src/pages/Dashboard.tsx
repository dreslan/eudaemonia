import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Quest, Achievement, Status } from '../types';
import { Circle, LayoutGrid, List, Archive, CheckCircle, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuestCard from '../components/QuestCard';
import DimensionBadge from '../components/DimensionBadge';
import Landing from './Landing';

const Dashboard: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Status | 'all'>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questsRes = await axios.get('http://localhost:8000/quests');
        const achievementsRes = await axios.get('http://localhost:8000/achievements');
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

  const handleStatusChange = async (questId: string, newStatus: Status) => {
      try {
          await axios.patch(`http://localhost:8000/quests/${questId}`, { status: newStatus });
          setQuests(quests.map(q => q.id === questId ? { ...q, status: newStatus } : q));
      } catch (error) {
          console.error("Error updating quest status", error);
      }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading dungeon data...</div>;
  }

  if (quests.length === 0 && achievements.length === 0) {
    return <Landing />;
  }

  const filteredQuests = quests.filter(q => {
      const matchesTab = activeTab === 'all' ? true : q.status === activeTab;
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (q.dimension || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
  });

  const tabs = [
      { id: 'active', label: 'Active', icon: Circle, color: 'text-orange-500' },
      { id: 'backlog', label: 'Backlog', icon: Archive, color: 'text-gray-500' },
      { id: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
      { id: 'all', label: 'All', icon: LayoutGrid, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-0 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-dcc-card p-4 rounded-lg shadow-sm border dark:border-dcc-system/20">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Status | 'all')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <tab.icon className={`w-4 h-4 mr-2 ${tab.color}`} />
                    {tab.label}
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-1.5 rounded-full text-gray-600 dark:text-gray-300">
                        {tab.id === 'all' ? quests.length : quests.filter(q => q.status === tab.id).length}
                    </span>
                </button>
            ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search quests..."
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
      {filteredQuests.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 italic text-lg">No quests found in {activeTab}.</p>
              {activeTab === 'active' && (
                  <Link to="/quests/new" className="mt-4 inline-block px-4 py-2 bg-dcc-system text-white rounded hover:bg-orange-700 transition-colors">
                      Start New Quest
                  </Link>
              )}
          </div>
      ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {filteredQuests.map(quest => (
                    <div key={quest.id} className="flex flex-col gap-2 w-full max-w-sm items-center">
                        <QuestCard 
                            quest={quest} 
                            username={user?.display_name || user?.username}
                        />
                        {/* Quick Actions */}
                        <div className="flex justify-end px-2 w-[320px]">
                            <select 
                                value={quest.status}
                                onChange={(e) => handleStatusChange(quest.id, e.target.value as Status)}
                                className="text-xs border-none bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer focus:ring-0"
                            >
                                <option value="active">Active</option>
                                <option value="backlog">Backlog</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-dcc-card shadow rounded-lg overflow-hidden border dark:border-dcc-system/20">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimension</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dcc-card divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuests.map(quest => (
                                <tr key={quest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/quests/${quest.id}`} className="text-orange-600 dark:text-dcc-system hover:underline font-medium flex items-center gap-2">
                                            {quest.title}
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <DimensionBadge dimension={quest.dimension} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {quest.due_date ? new Date(quest.due_date).toLocaleDateString() : <span className="italic text-xs opacity-50">Heat death of universe</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={quest.status}
                                            onChange={(e) => handleStatusChange(quest.id, e.target.value as Status)}
                                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 ${
                                                quest.status === 'active' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                quest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="backlog">Backlog</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/quests/${quest.id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )
      )}
    </div>
  );
};

export default Dashboard;
