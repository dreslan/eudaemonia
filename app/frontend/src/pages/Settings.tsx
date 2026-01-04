import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, Shield, Skull, ExternalLink } from 'lucide-react';
import type { Quest, Achievement } from '../types';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.openai_api_key) {
        setApiKey(user.openai_api_key);
    }
    
    const fetchData = async () => {
        try {
            const [questsRes, achievementsRes] = await Promise.all([
                axios.get('http://localhost:8000/quests'),
                axios.get('http://localhost:8000/achievements')
            ]);
            setQuests(questsRes.data);
            setAchievements(achievementsRes.data);
        } catch (error) {
            console.error("Error fetching data for settings", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [user]);

  const handleUpdateApiKey = async () => {
    if (!user) return;
    try {
      const res = await axios.put('http://localhost:8000/profile', { 
          openai_api_key: apiKey
      });
      updateUser({ ...user, openai_api_key: res.data.openai_api_key });
      alert("API Key updated successfully");
    } catch (error) {
      console.error("Error updating API key", error);
      alert("Failed to update API key");
    }
  };

  const handleBulkVisibility = async (type: 'quests' | 'achievements', isHidden: boolean) => {
      if (!window.confirm(`Are you sure you want to ${isHidden ? 'hide' : 'show'} ALL ${type}?`)) return;
      
      try {
          // In a real app, we'd have a bulk endpoint. For now, we'll loop (inefficient but works for prototype)
          // Or better, let's just update the local state and assume the user will refresh or we implement a bulk endpoint later.
          // Actually, let's just do it one by one for now to be safe, or skip implementation if it's too complex for this step.
          // Let's implement a simple loop for now.
          const items = type === 'quests' ? quests : achievements;
          const endpoint = type === 'quests' ? 'quests' : 'achievements';
          
          const promises = items.map(item => 
              axios.patch(`http://localhost:8000/${endpoint}/${item.id}`, { is_hidden: isHidden })
          );
          
          await Promise.all(promises);
          alert(`All ${type} are now ${isHidden ? 'hidden' : 'visible'}.`);
          
          // Refresh data
          const res = await axios.get(`http://localhost:8000/${endpoint}`);
          if (type === 'quests') setQuests(res.data);
          else setAchievements(res.data);
          
      } catch (error) {
          console.error("Error updating bulk visibility", error);
          alert("Failed to update visibility");
      }
  };

  const handleExportData = () => {
      const dataStr = JSON.stringify({ user, quests, achievements }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'questvault_data.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const handleResetData = async () => {
      if (window.confirm("DANGER: This will delete ALL your quests and achievements. This cannot be undone. Are you sure?")) {
          try {
              await axios.post('http://localhost:8000/reset');
              window.location.reload();
          } catch (error) {
              console.error("Error resetting data", error);
              alert("Failed to reset data");
          }
      }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4">Account Settings</h1>

      {/* GenAI Settings */}
      <section className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2 text-dcc-system" />
            GenAI Configuration
        </h2>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    OpenAI API Key
                </label>
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-800 dark:text-white sm:text-sm p-2 border"
                    />
                    <button 
                        onClick={handleUpdateApiKey}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Save
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Required for AI-generated descriptions and rewards. Your key is stored locally or securely in the database.
                </p>
            </div>
        </div>
      </section>

      {/* Privacy & Visibility */}
      <section className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-dcc-system" />
            Privacy & Visibility
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Quests</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleBulkVisibility('quests', false)}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                        Show All
                    </button>
                    <button 
                        onClick={() => handleBulkVisibility('quests', true)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Hide All
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Achievements</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleBulkVisibility('achievements', false)}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                        Show All
                    </button>
                    <button 
                        onClick={() => handleBulkVisibility('achievements', true)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Hide All
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2 text-dcc-system" />
            Data Management
        </h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download a JSON copy of all your quests and achievements.</p>
                </div>
                <button 
                    onClick={handleExportData}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                    Download JSON
                </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <div>
                    <h3 className="font-medium text-red-800 dark:text-red-400 flex items-center">
                        <Skull className="w-4 h-4 mr-2" /> Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400/70">Permanently delete all your data. This cannot be undone.</p>
                </div>
                <button 
                    onClick={handleResetData}
                    className="px-4 py-2 border border-red-300 dark:border-red-800 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none"
                >
                    Reset All Data
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
