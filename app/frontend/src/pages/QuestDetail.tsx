import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Quest, Achievement, Status } from '../types';
import { ArrowLeft, Edit, Trash2, Plus, LayoutGrid, List, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AchievementCard from '../components/AchievementCard';
import Timeline from '../components/Timeline';

const QuestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [linkedAchievements, setLinkedAchievements] = useState<Achievement[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'table'>('timeline');

  const fetchData = async () => {
    try {
      const questRes = await axios.get(`http://localhost:8000/quests/${id}`);
      setQuest(questRes.data);
      
      const achievementsRes = await axios.get('http://localhost:8000/achievements');
      
      // Sort: Date Ascending, then Creation Order (Index) Ascending
      const linked = achievementsRes.data
        .map((a: Achievement, index: number) => ({ ...a, _originalIndex: index }))
        .filter((a: any) => a.quest_id === id)
        .sort((a: any, b: any) => {
            const dateDiff = new Date(a.date_completed).getTime() - new Date(b.date_completed).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a._originalIndex - b._originalIndex;
        });
        
      setLinkedAchievements(linked);
    } catch (error) {
      console.error("Error fetching quest details", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this quest? This cannot be undone.")) {
        try {
            await axios.delete(`http://localhost:8000/quests/${id}`);
            navigate('/');
        } catch (error) {
            console.error("Error deleting quest", error);
        }
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
      try {
          const res = await axios.patch(`http://localhost:8000/quests/${id}`, { status: newStatus });
          setQuest(res.data);
      } catch (error) {
          console.error("Error updating quest status", error);
      }
  };

  if (!quest) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-dcc-system dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex flex-wrap gap-2">
            {/* Status Dropdown */}
            <select 
                value={quest.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                className={`text-sm font-semibold rounded-md px-3 py-2 border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 ${
                    quest.status === 'active' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    quest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    quest.status === 'backlog' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
            >
                <option value="active">Active</option>
                <option value="backlog">Backlog</option>
                <option value="maybe">Maybe</option>
                <option value="completed">Completed</option>
            </select>

            <Link
                to={`/quests/${id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-dcc-card dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
                <Edit className="w-4 h-4 mr-1" /> Edit
            </Link>
            <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-dcc-danger dark:hover:bg-red-600"
            >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
            </button>
        </div>
      </div>

      {/* Quest Details Card */}
      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-8 border dark:border-dcc-system/20">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quest.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
                {quest.dimension && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {quest.dimension}
                    </span>
                )}
                {quest.tags && quest.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Victory Condition</h3>
            <p className="text-gray-600 dark:text-gray-300">{quest.victory_condition || "No specific victory condition set."}</p>
        </div>
      </div>

      {/* Quest Log Section */}
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quest Log</h2>
              
              <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                      <button
                          onClick={() => setViewMode('timeline')}
                          className={`p-2 rounded-l-md ${viewMode === 'timeline' ? 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-dcc-system' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                          title="Timeline View"
                      >
                          <Calendar className="h-4 w-4" />
                      </button>
                      <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-dcc-system' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                          title="Grid View"
                      >
                          <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                          onClick={() => setViewMode('table')}
                          className={`p-2 rounded-r-md ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-dcc-system' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                          title="Table View"
                      >
                          <List className="h-4 w-4" />
                      </button>
                  </div>

                  <Link 
                      to={`/achievements/new?quest_id=${id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dcc-system hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:hover:bg-orange-400"
                  >
                      <Plus className="w-4 h-4 mr-2" />
                      Log Progress
                  </Link>
              </div>
          </div>

          {/* Log Content */}
          {viewMode === 'timeline' && (
              <Timeline achievements={linkedAchievements} />
          )}

          {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {linkedAchievements.map(ach => (
                      <AchievementCard 
                          key={ach.id} 
                          achievement={ach} 
                          username={user?.display_name || user?.username}
                      />
                  ))}
              </div>
          )}

          {viewMode === 'table' && (
              <div className="bg-white dark:bg-dcc-card shadow rounded-lg overflow-hidden border dark:border-dcc-system/20">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-dcc-card divide-y divide-gray-200 dark:divide-gray-700">
                          {linkedAchievements.map(ach => (
                              <tr key={ach.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                      {new Date(ach.date_completed).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <Link to={`/achievements/${ach.id}`} className="text-orange-600 dark:text-dcc-system hover:underline font-bold">
                                          {ach.title}
                                      </Link>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                      {ach.context}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <Link to={`/achievements/${ach.id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                          View
                                      </Link>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default QuestDetail;
