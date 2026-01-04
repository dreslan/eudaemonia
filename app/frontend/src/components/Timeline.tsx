import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import type { Achievement } from '../types';

interface TimelineProps {
    achievements: Achievement[];
}

const Timeline: React.FC<TimelineProps> = ({ achievements }) => {
    if (achievements.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 italic">
                No history recorded yet.
            </div>
        );
    }

    // Sort by date (oldest first per user request)
    const sortedAchievements = [...achievements].sort((a, b) => 
        new Date(a.date_completed).getTime() - new Date(b.date_completed).getTime()
    );

    return (
        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 py-4">
            {sortedAchievements.map((achievement) => (
                <div key={achievement.id} className="relative pl-8 group">
                    {/* Node */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-orange-500 dark:border-dcc-system group-hover:scale-125 transition-transform" />
                    
                    {/* Content */}
                    <div className="bg-white dark:bg-dcc-card p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(achievement.date_completed).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                        {new Date(achievement.date_completed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    <Link to={`/achievements/${achievement.id}`} className="hover:text-orange-600 dark:hover:text-dcc-system transition-colors flex items-center gap-2">
                                        {achievement.title}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                                    </Link>
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                    {achievement.context}
                                </p>
                                
                                {achievement.ai_description && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded text-sm italic text-gray-600 dark:text-gray-400 border-l-2 border-orange-200 dark:border-orange-900">
                                        "{achievement.ai_description}"
                                    </div>
                                )}
                            </div>

                            {achievement.image_url && (
                                <div className="sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                    <img 
                                        src={achievement.image_url} 
                                        alt={achievement.title} 
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;
