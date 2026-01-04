import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ExternalLink, RotateCw } from 'lucide-react';
import type { Achievement } from '../types';
import { dimensionColors } from '../utils/colors';
import { getDimensionIcon } from '../utils/dimensionIcons';

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
    const [isFlipped, setIsFlipped] = useState(false);
    const [imgError, setImgError] = useState(false);
    const dimension = achievement.dimension || 'default';
    const theme = dimensionColors[dimension] || dimensionColors.default;
    const shareUrl = `${window.location.origin}/public/achievement/${achievement.id}`;
    const Icon = getDimensionIcon(dimension);

    const handlePrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/print/achievements/${achievement.id}`, '_blank');
    };

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!forceFace) {
            setIsFlipped(!isFlipped);
        }
    };

    // Render content based on face
    const renderContent = () => {
        const BackContent = (
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
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
                    <div className="bg-white p-3 rounded-xl shadow-2xl border-4 border-gray-900">
                        <QRCodeSVG value={shareUrl} size={160} />
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase text-black tracking-widest bg-yellow-500 px-2 py-1 rounded border-2 border-black">
                        Unlocked by {username}
                    </p>
                    <p className="mt-2 text-[10px] font-mono text-black/70 uppercase tracking-widest">
                        Scan to redeem cash value
                    </p>
                </div>
                
                {/* Footer */}
                <div className="bg-gray-900 p-4 border-t-4 border-yellow-600 relative z-10 text-center shadow-md">
                    <h3 className="font-['Cinzel'] font-black text-xl text-yellow-500 tracking-widest drop-shadow-md">NEW ACHIEVEMENT!</h3>
                </div>

                {!forceFace && (
                    <div className="absolute top-4 right-4 z-20 print:hidden">
                        <button 
                            onClick={handleFlip}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        >
                            <RotateCw size={20} />
                        </button>
                    </div>
                )}
            </div>
        );

        if (forceFace === 'back') {
            return BackContent;
        }

        // Default to Front
        const FrontContent = (
            <div className={`w-full h-full rounded-2xl overflow-hidden bg-gray-900 text-white flex flex-col border-[12px] border-yellow-600 shadow-2xl relative`}>
                {/* Inner Border */}
                <div className={`absolute inset-0 border-[2px] border-yellow-400/50 rounded-lg pointer-events-none z-20`}></div>

                {/* Header */}
                <div className={`bg-gradient-to-b ${theme.from800} ${theme.to900} p-3 border-b-4 border-yellow-600 relative z-10`}>
                    <div className="flex justify-between items-start pr-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-['Cinzel'] font-bold text-sm leading-tight text-white drop-shadow-md truncate" title={achievement.title}>
                                {achievement.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`flex items-center justify-center w-5 h-5 rounded-full bg-black/30 ${theme.text200} border ${theme.border500} border-opacity-30 shadow-sm`}>
                                    <Icon size={12} strokeWidth={2.5} />
                                </div>
                                {questTitle && (
                                    <span className={`text-[9px] font-bold uppercase tracking-widest text-yellow-500 truncate max-w-[120px]`}>
                                        • {questTitle}
                                    </span>
                                )}
                            </div>
                        </div>
                        {!forceFace && (
                            <button 
                                onClick={handleFlip}
                                className="ml-2 p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white print:hidden"
                                title="Flip Card"
                            >
                                <RotateCw size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Art Area */}
                <div className="relative h-40 bg-black border-b-4 border-yellow-600 overflow-hidden flex items-center justify-center">
                    {achievement.image_url && !imgError ? (
                        <img 
                            src={achievement.image_url} 
                            alt={achievement.title}
                            className="w-full h-full object-cover opacity-90"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 select-none">
                            <Icon size={120} className={`${theme.text500} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`} strokeWidth={1} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>

                {/* Body */}
                <div className="flex-1 p-3 flex flex-col gap-3 relative bg-gray-900 overflow-hidden">
                    {/* AI Description */}
                    <div className="font-['Cormorant_Garamond'] text-sm text-gray-200 leading-relaxed line-clamp-6">
                        {achievement.ai_description || achievement.context}
                    </div>
                </div>

                {/* Footer */}
                <div className={`bg-gray-900 border-t-2 border-yellow-600 min-h-[40px] flex items-center justify-between px-3 py-2 relative z-10`}>
                    <div className="flex-1 flex flex-col justify-center max-w-[80%]">
                        {achievement.ai_reward && (
                            <div className="flex flex-col mb-2 pb-2 border-b border-gray-800">
                                <div className="text-[8px] text-yellow-500 uppercase font-bold tracking-widest">Reward</div>
                                <div className="text-[10px] font-bold text-white truncate font-['Cinzel']" title={achievement.ai_reward}>{achievement.ai_reward}</div>
                            </div>
                        )}
                        <div className="text-[9px] text-gray-400 font-mono leading-tight">
                            AWARDED TO <span className="font-black text-yellow-500 text-[11px]">{username.toUpperCase()}</span> ON {new Date(achievement.date_completed).toLocaleDateString()}
                        </div>
                        <span className="text-[6px] text-gray-600 mt-1 leading-tight font-mono">
                            FINE PRINT: ACHIEVEMENT HAS NO CASH VALUE. MANAGEMENT DENIES ALL KNOWLEDGE OF HOW THIS WAS ACCOMPLISHED.
                        </span>
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

        if (forceFace === 'front') return FrontContent;

        return (
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front Face */}
                <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg) translateZ(1px)' }}>
                    {FrontContent}
                </div>
                
                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}>
                    {BackContent}
                </div>
            </div>
        );
    };

    return (
        <div className={`relative w-[320px] h-[480px] group perspective-1000 ${className}`}>
            {renderContent()}
        </div>
    );
};

export default AchievementCard;