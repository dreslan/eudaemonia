import React from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ExternalLink } from 'lucide-react';
import type { Achievement } from '../types';
import { dimensionColors } from '../utils/colors';
import { getAsciiArt } from '../utils/ascii';

interface AchievementCardProps {
    achievement: Achievement;
    username?: string;
    questTitle?: string;
    className?: string;
    forceFace?: 'front' | 'back';
    hideActions?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
    achievement, 
    username = 'Anonymous', 
    questTitle, 
    className = '',
    forceFace,
    hideActions = false
}) => {
    const dimension = achievement.dimension || 'default';
    const theme = dimensionColors[dimension] || dimensionColors.default;
    const shareUrl = `${window.location.origin}/public/achievement/${achievement.id}`;
    const asciiArt = getAsciiArt(dimension);

    const handlePrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/print/achievements/${achievement.id}`, '_blank');
    };

    // Render content based on face
    const renderContent = () => {
        if (forceFace === 'back') {
            return (
                <div className={`w-full h-full rounded-2xl overflow-hidden bg-yellow-500 border-[12px] border-yellow-600 shadow-2xl flex flex-col relative`}>
                    {/* Pattern Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] -rotate-45 opacity-10 flex items-center justify-center">
                            <p className="text-[10px] font-black uppercase text-black tracking-widest leading-relaxed text-center w-full break-words">
                                {Array.from({ length: 800 }).fill("NEW ACHIEVEMENT!").join(" ")}
                            </p>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="bg-gray-900 p-4 border-b-4 border-yellow-600 relative z-10 text-center shadow-md">
                        <h3 className="font-['Cinzel'] font-black text-xl text-yellow-500 tracking-widest drop-shadow-md">NEW ACHIEVEMENT!</h3>
                    </div>

                    {/* Body - QR Code */}
                    <div className="flex-1 flex items-center justify-center relative z-10 p-4">
                        <div className="bg-white p-3 rounded-xl shadow-2xl border-4 border-gray-900">
                            <QRCodeSVG value={shareUrl} size={160} />
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-gray-900 p-4 border-t-4 border-yellow-600 relative z-10 text-center shadow-md">
                        <h3 className="font-['Cinzel'] font-black text-xl text-yellow-500 tracking-widest drop-shadow-md">NEW ACHIEVEMENT!</h3>
                    </div>
                </div>
            );
        }

        // Default to Front
        return (
            <div className={`w-full h-full rounded-2xl overflow-hidden bg-gray-900 text-white flex flex-col border-[12px] border-yellow-600 shadow-2xl`}>
                {/* Inner Border */}
                <div className={`absolute inset-0 border-[2px] border-yellow-400/50 rounded-lg pointer-events-none z-20`}></div>

                {/* Header */}
                <div className={`bg-gradient-to-b ${theme.from800} ${theme.to900} p-3 border-b-4 border-yellow-600 relative z-10`}>
                    <div className="flex justify-between items-center pr-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-['Cinzel'] font-bold text-sm leading-tight text-white drop-shadow-md truncate" title={achievement.title}>
                                {achievement.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/30 ${theme.text200} border ${theme.border500} border-opacity-30`}>
                                    {dimension}
                                </span>
                                {questTitle && (
                                    <span className={`text-[9px] font-bold uppercase tracking-widest text-yellow-500 truncate max-w-[120px]`}>
                                        • {questTitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Art Area */}
                <div className="relative h-40 bg-black border-b-4 border-yellow-600 overflow-hidden flex items-center justify-center">
                    {achievement.image_url ? (
                        <img 
                            src={achievement.image_url} 
                            alt={achievement.title}
                            className="w-full h-full object-cover opacity-90"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
                            <pre className={`text-[8px] leading-[8px] font-mono ${theme.text200} whitespace-pre`}>
                                {asciiArt}
                            </pre>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>

                {/* Body */}
                <div className="flex-1 p-3 flex flex-col gap-3 relative bg-gray-900 overflow-hidden">
                    {/* User Quote */}
                    <div className="bg-gray-800/80 p-2 rounded border-l-2 border-yellow-500">
                        <p className="font-['Cormorant_Garamond'] text-xs italic text-gray-300 leading-relaxed">
                            <span className={`text-yellow-500 font-bold not-italic mr-1`}>{username}:</span>
                            "{achievement.context}"
                        </p>
                    </div>
                    
                    {/* AI Description */}
                    {achievement.ai_description && (
                        <div className="font-['Cormorant_Garamond'] text-sm text-gray-200 leading-relaxed line-clamp-4 border-t border-gray-800 pt-2">
                            {achievement.ai_description}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`bg-gray-900 border-t-2 border-yellow-600 min-h-[40px] flex items-center justify-between px-3 py-2 relative z-10`}>
                    <div className="flex-1 flex flex-col justify-center">
                        {achievement.ai_reward && (
                            <div className="flex flex-col mb-1">
                                <div className="text-[8px] text-yellow-500 uppercase font-bold tracking-widest">Reward</div>
                                <div className="text-[10px] font-bold text-white truncate font-['Cinzel']" title={achievement.ai_reward}>{achievement.ai_reward}</div>
                            </div>
                        )}
                        <div className="text-[9px] text-gray-400 font-mono">
                            {new Date(achievement.date_completed).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="flex gap-2 ml-2 print:hidden">
                        {!hideActions && (
                            <>
                                <button 
                                    onClick={handlePrint}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Print Card"
                                >
                                    <Printer size={16} />
                                </button>
                                <Link 
                                    to={`/achievements/${achievement.id}`}
                                    className="text-yellow-500 hover:text-yellow-200 transition-colors"
                                    title="View Details"
                                >
                                    <ExternalLink size={16} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`relative w-[320px] h-[480px] ${className}`}>
            {renderContent()}
        </div>
    );
};

export default AchievementCard;