import React from 'react';
import { Link } from 'react-router-dom';
import { Skull } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-dcc-card text-gray-900 dark:text-white rounded-xl border-2 border-dcc-system shadow-xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full shadow-sm">
                <Skull className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-dcc-system">
                Welcome, {user?.display_name || user?.username || "Player"}!
            </h1>
            
            <div className="space-y-4 max-w-xl">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Oh, look at you. Fresh meat. You haven't done <span className="text-red-600 dark:text-red-400 italic">anything</span> yet.
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                    You have zero quests. Zero achievements. You are statistically insignificant. 
                    But don't worry, the dungeon will grind you down regardless of your participation.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/quests/new" className="px-6 py-3 bg-dcc-system text-white dark:text-black font-bold text-base uppercase tracking-wider rounded hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors shadow-md">
                    Start First Quest
                </Link>
                <Link to="/achievements/new" className="px-6 py-3 bg-white dark:bg-gray-800 text-dcc-system border-2 border-dcc-system font-bold text-base uppercase tracking-wider rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md">
                    Log Achievement
                </Link>
            </div>
        </div>
    </div>
  );
};

export default Landing;
