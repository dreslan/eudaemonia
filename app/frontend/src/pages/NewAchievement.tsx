import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AchievementCreate, Quest } from '../types';

const NewAchievement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questIdParam = searchParams.get('quest_id');
  
  const [quests, setQuests] = useState<Quest[]>([]);
  const [formData, setFormData] = useState<AchievementCreate>({
    title: '',
    context: '',
    dimension: null,
    date_completed: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
    quest_id: '',
    use_genai: false
  });

  useEffect(() => {
    const fetchQuests = async () => {
        try {
            const res = await axios.get('http://localhost:8000/quests');
            setQuests(res.data.filter((q: Quest) => q.status !== 'completed'));
        } catch (error) {
            console.error("Error fetching quests", error);
        }
    };
    fetchQuests();
  }, []);

  useEffect(() => {
    if (questIdParam && quests.length > 0) {
        const selectedQuest = quests.find(q => q.id === questIdParam);
        if (selectedQuest) {
            if (formData.quest_id !== questIdParam || formData.dimension !== selectedQuest.dimension) {
                 // eslint-disable-next-line
                 setFormData(prev => ({ 
                    ...prev, 
                    quest_id: questIdParam,
                    dimension: selectedQuest.dimension 
                }));
            }
        }
    }
  }, [questIdParam, quests, formData.quest_id, formData.dimension]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'quest_id') {
        const selectedQuest = quests.find(q => q.id === value);
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            dimension: selectedQuest ? selectedQuest.dimension : prev.dimension
        }));
    } else if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/achievements', formData);
      navigate(`/achievements/${res.data.id}/reveal`);
    } catch (error) {
      console.error("Error creating achievement", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-pulse">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 uppercase tracking-widest transform -rotate-2">
                New Achievement!
            </h1>
        </div>

        <div className="bg-white dark:bg-dcc-card shadow-xl rounded-lg p-8 border-t-4 border-yellow-400 dark:border-dcc-gold">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="What did you accomplish?"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                    name="context"
                    rows={3}
                    required
                    placeholder="Describe what happened."
                    value={formData.context}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Linked Quest (Optional)</label>
                    <select
                        name="quest_id"
                        value={formData.quest_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">-- None --</option>
                        {quests.map(q => (
                            <option key={q.id} value={q.id}>{q.title}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dimension</label>
                    <select
                    name="dimension"
                    value={formData.dimension || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                    <option value="">-- None --</option>
                    {['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual'].map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Completed</label>
                    <input
                    type="datetime-local"
                    name="date_completed"
                    value={formData.date_completed}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Use GenAI</span>
                        <div className="relative group">
                            <div className="cursor-help text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 text-center pointer-events-none z-10 shadow-lg">
                                When enabled, the Achievement card content will be generated by GenAI in the style of the DCC AI. Otherwise, your input is used as-is. Requires a GenAI API key in your profile.
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            name="use_genai"
                            checked={formData.use_genai || false} 
                            onChange={handleChange} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                    </label>
                </div>

                <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transform transition hover:scale-105"
                >
                CLAIM GLORY
                </button>
            </form>
        </div>
    </div>
  );
};

export default NewAchievement;
