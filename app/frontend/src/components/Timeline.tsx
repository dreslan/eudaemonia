import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, Flag } from 'lucide-react';
import type { Achievement } from '../types';
import { dimensionColors } from '../utils/colors';
import { getDimensionIcon } from '../utils/dimensionIcons';

interface TimelineProps {
    achievements: Achievement[];
}

const TimelineImage: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const [imgError, setImgError] = useState(false);
    const dimension = achievement.dimension || 'default';
    const theme = dimensionColors[dimension] || dimensionColors.default;
    const Icon = getDimensionIcon(dimension);

    return (
        <div className="sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
            {achievement.image_url && !imgError ? (
                <img 
                    src={achievement.image_url} 
                    alt={achievement.title} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <Icon size={48} className={`${theme.text500} opacity-80`} strokeWidth={1.5} />
                </div>
            )}
        </div>
    );
};

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
        <div className="relative ml-3 py-4">
            {sortedAchievements.map((achievement, index) => {
                const isQuestComplete = achievement.title.startsWith("Quest Complete:");
                const isLast = index === sortedAchievements.length - 1;
                
                return (
                <div key={achievement.id} className="relative pl-8 pb-8 group">
                    {/* Vertical Line */}
                    {!isLast && (
                        <div className="absolute left-[-1px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}

                    {/* Node */}
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 z-10 ${
                        isQuestComplete 
                        ? 'bg-green-500 border-green-600 dark:bg-green-600 dark:border-green-400' 
                        : 'bg-white dark:bg-gray-900 border-orange-500 dark:border-dcc-system'
                    }`} />
                    
                    {/* Content */}
                    <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                        isQuestComplete
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-white dark:bg-dcc-card border-gray-200 dark:border-gray-700'
                    }`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        {isQuestComplete ? <Flag className="w-3 h-3 text-green-600 dark:text-green-400" /> : <Calendar className="w-3 h-3" />}
                                        {new Date(achievement.date_completed).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                        {new Date(achievement.date_completed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                
                                <h3 className={`text-lg font-bold mb-2 ${
                                    isQuestComplete ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'
                                }`}>
                                    <Link to={`/achievements/${achievement.id}`} className="hover:underline transition-colors flex items-center gap-2">
                                        {achievement.title}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                                    </Link>
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                    {achievement.context}
                                </p>
                                
                                {achievement.ai_description && (
                                    <div className={`mt-3 p-3 rounded text-sm italic border-l-2 ${
                                        isQuestComplete
                                        ? 'bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
                                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-orange-200 dark:border-orange-900'
                                    }`}>
                                        "{achievement.ai_description}"
                                    </div>
                                )}
                            </div>

                            <TimelineImage achievement={achievement} />
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
    );
};

export default Timeline;
