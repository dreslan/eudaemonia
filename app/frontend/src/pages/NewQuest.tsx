import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestCreate } from '../types';

const NewQuest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<QuestCreate>({
    title: '',
    dimension: null,
    status: 'active',
    tags: [],
    victory_condition: ''
  });

  const dccQuotes: Record<string, string> = {
    intellectual: "Trying to grow a wrinkle on that smooth brain of yours? How ambitious. Don't hurt yourself thinking too hard.",
    physical: "Time to sweat, Crawler. The audience loves it when you suffer. Try not to die of exhaustion.",
    financial: "Gathering gold? Smart. You'll need it to bribe the producers or buy a decent funeral.",
    environmental: "Cleaning up your cage? How domestic. The dungeon janitors are on strike anyway.",
    vocational: "Work, work, work. You're just a cog in the machine, but at least be a shiny cog.",
    social: "Making friends? Don't get too attached. They usually explode, get eaten, or betray you for a loot box.",
    emotional: "Aww, having feelings? Bottle that up. Emotions are a weakness in the dungeon. Or monetize them.",
    spiritual: "Praying to the AI gods? We're listening, but we mostly just want to be entertained.",
    default: "You're doing something. I hope it's entertaining."
  };

  const sampleText: Record<string, { title: string, victory: string }> = {
    intellectual: { title: "Learn Rocket Surgery", victory: "Complete the 'Intro to Propulsion' course without blowing anything up." },
    physical: { title: "Outrun a Goblin", victory: "Run 5km in under 30 minutes (or before the goblin catches me)." },
    financial: { title: "Amass a Hoard", victory: "Save $500 in the 'Loot' account for a rainy day." },
    environmental: { title: "Purge the Filth", victory: "Deep clean the kitchen until I can see my reflection in the toaster." },
    vocational: { title: "Climb the Ladder", victory: "Apply to 5 jobs that don't sound soul-crushing." },
    social: { title: "Infiltrate the Party", victory: "Attend the networking event and speak to at least 3 humans." },
    emotional: { title: "Tame the Rage Beast", victory: "Practice deep breathing for 10 minutes when I want to smash something." },
    spiritual: { title: "Commune with the AI", victory: "Meditate for 15 minutes without checking my phone." },
    default: { title: "Do a Thing", victory: "Complete the thing successfully." }
  };

  useEffect(() => {
    if (isEditMode && id) {
        const fetchQuest = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/quests/${id}`);
                setFormData(res.data);
            } catch (error) {
                console.error("Error fetching quest for edit", error);
            }
        };
        fetchQuest();
    }
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && id) {
        await axios.patch(`http://localhost:8000/quests/${id}`, formData);
      } else {
        await axios.post('http://localhost:8000/quests', formData);
      }
      navigate(isEditMode ? `/quests/${id}` : '/');
    } catch (error) {
      console.error("Error saving quest", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-dcc-card shadow rounded-lg p-8 border dark:border-dcc-system/20">
      <h1 className="text-3xl font-bold mb-2 text-orange-600 dark:text-dcc-system">{isEditMode ? 'Edit Quest' : 'New Quest'}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {isEditMode ? 'Update your adventure details.' : 'Define your adventure.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quest Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    placeholder={`e.g. ${sampleText[formData.dimension || 'default'].title}`}
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dimension</label>
                <select
                name="dimension"
                value={formData.dimension || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                <option value="">-- None --</option>
                {['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual'].map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
                </select>
                <p className="mt-2 text-xs text-orange-600 dark:text-dcc-system italic border-l-2 border-orange-300 dark:border-dcc-system pl-2">
                    "AI: {dccQuotes[formData.dimension || 'default']}"
                </p>
            </div>
        </div>

        {/* Victory Condition */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Victory Condition (Definition of Done)</label>
            <textarea
                name="victory_condition"
                rows={3}
                placeholder={`What does success look like? e.g. ${sampleText[formData.dimension || 'default'].victory}`}
                value={formData.victory_condition}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
            />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-dcc-system dark:text-black dark:hover:bg-orange-400"
        >
          {isEditMode ? 'Save Changes' : 'Start Quest'}
        </button>
      </form>
    </div>
  );
};

export default NewQuest;
