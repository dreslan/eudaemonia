import React, { useState } from 'react';
import type { User, Dimension, Achievement } from '../types';
import { dimensionColors } from '../utils/colors';
import { getDimensionIcon } from '../utils/dimensionIcons';
import { QRCodeSVG } from 'qrcode.react';
import { getPlayerClass } from '../utils/playerClass';

interface CharacterCardProps {
    user: User;
    achievements?: Achievement[];
    className?: string;
    forceFace?: 'front' | 'back';
}

const CharacterCard: React.FC<CharacterCardProps> = ({ 
    user, 
    achievements = [],
    className = '',
    forceFace
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Calculate Character Level (min of all dimension levels, or just user.level)
    // For now, use user.level or 1
    const level = user.level || 1;
    const { className: playerClass, description: classDescription } = getPlayerClass(user);
    const publicProfileUrl = `${window.location.origin}/public/profile/${user.username}`;
    
    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!forceFace) {
            setIsFlipped(!isFlipped);
        }
    };

    const dimensions: Dimension[] = ['intellectual', 'physical', 'financial', 'environmental', 'vocational', 'social', 'emotional', 'spiritual'];
    
    // Prepare data for Radar Chart
    const stats = user.dimension_stats || [];
    const maxLevel = Math.max(...stats.map(s => s.level), 10); // Scale based on max level, min 10
    
    const getPoint = (value: number, index: number, total: number, radius: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const x = radius + Math.cos(angle) * (radius * (value / maxLevel));
        const y = radius + Math.sin(angle) * (radius * (value / maxLevel));
        return `${x},${y}`;
    };

    const radarPoints = dimensions.map((dim, i) => {
        const stat = stats.find(s => s.dimension === dim);
        const val = stat ? stat.level : 1;
        return getPoint(val, i, dimensions.length, 50);
    }).join(' ');

    const BackContent = (
        <div 
            onClick={handleFlip}
            className={`w-full h-full rounded-2xl overflow-hidden bg-gray-900 border-[12px] border-gray-800 shadow-2xl flex flex-col relative cursor-pointer`}
        >
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b-4 border-gray-700 text-center">
                <h3 className="font-['Cinzel'] font-black text-xl text-gray-300 tracking-widest">BUILD</h3>
            </div>

            {/* Body - Radar Chart */}
            <div className="flex-1 flex flex-col items-center justify-start p-4 relative space-y-4">
                <div className="w-40 h-40 relative mt-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        {/* Background Grid */}
                        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
                            <polygon 
                                key={scale}
                                points={dimensions.map((_, i) => getPoint(maxLevel * scale, i, dimensions.length, 50)).join(' ')}
                                fill="none"
                                stroke="#374151"
                                strokeWidth="0.5"
                            />
                        ))}
                        
                        {/* Axes */}
                        {dimensions.map((_, i) => (
                            <line 
                                key={i}
                                x1="50" y1="50"
                                x2={getPoint(maxLevel, i, dimensions.length, 50).split(',')[0]}
                                y2={getPoint(maxLevel, i, dimensions.length, 50).split(',')[1]}
                                stroke="#374151"
                                strokeWidth="0.5"
                            />
                        ))}

                        {/* Data */}
                        <polygon 
                            points={radarPoints}
                            fill="rgba(249, 115, 22, 0.5)"
                            stroke="#f97316"
                            strokeWidth="2"
                        />
                    </svg>
                    
                    {/* Labels */}
                    {dimensions.map((dim, i) => {
                        const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
                        const radius = 65; // Push labels out
                        const x = 50 + Math.cos(angle) * radius;
                        const y = 50 + Math.sin(angle) * radius;
                        const Icon = getDimensionIcon(dim);
                        const color = dimensionColors[dim].text400;
                        
                        return (
                            <div 
                                key={dim}
                                className={`absolute flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 border border-gray-700 ${color}`}
                                style={{ 
                                    left: `${x}%`, 
                                    top: `${y}%`, 
                                    transform: 'translate(-50%, -50%)' 
                                }}
                                title={dim}
                            >
                                <Icon size={12} />
                            </div>
                        );
                    })}
                </div>

                {/* Top Feats */}
                <div className="w-full space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-700 pb-1">Top Feats</h4>
                    {achievements.length > 0 ? (
                        <div className="space-y-1">
                            {achievements.slice(0, 3).map((ach, i) => (
                                <div key={i} className="text-xs text-gray-300 truncate flex items-center gap-1">
                                    <span className="text-orange-500">★</span> {ach.title}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-600 text-center italic">No feats recorded yet.</div>
                    )}
                </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-800 p-3 border-t-4 border-gray-700 text-center">
                <div className="text-[10px] text-gray-400 italic">
                    "{classDescription}"
                </div>
            </div>
        </div>
    );

    if (forceFace === 'back') {
        return (
            <div className={`perspective-1000 w-[320px] h-[480px] ${className}`}>
                <div className="relative w-full h-full">
                    {BackContent}
                </div>
            </div>
        );
    }

    const FrontContent = (
        <div 
            onClick={handleFlip}
            className={`w-full h-full rounded-2xl overflow-hidden bg-gray-900 text-white flex flex-col border-[12px] border-orange-900 shadow-2xl relative cursor-pointer`}
        >
            {/* Header */}
            <div className="bg-gradient-to-b from-orange-800 to-orange-900 p-4 border-b-4 border-orange-700 relative z-10 text-center">
                <h3 className="font-['Cinzel'] font-bold text-2xl text-white drop-shadow-md">
                        {playerClass.toUpperCase()}
                </h3>
            </div>

            {/* Body */}
            <div className="flex-1 relative bg-gray-800 p-4 flex flex-col items-center">
                {/* Avatar Placeholder */}
                <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-orange-500 mb-4 flex items-center justify-center overflow-hidden relative z-10">
                    <span className="text-4xl">👤</span>
                </div>
                
                <h2 className="text-xl font-bold text-orange-400 mb-1 relative z-10">{user.display_name || user.username}</h2>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-4 relative z-10">Level {level}</div>
                
                <div className="w-full bg-gray-900 rounded-full h-4 border border-gray-700 relative overflow-hidden z-10">
                    <div 
                        className="absolute top-0 left-0 h-full bg-orange-600"
                        style={{ width: `${(level % 1) * 100}%` }} // Placeholder for progress to next level
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tracking-wider text-white/80">
                        PROGRESS TO NEXT LEVEL
                    </div>
                </div>

                {/* QR Code Overlay */}
                <div className="absolute bottom-2 right-2 opacity-50 hover:opacity-100 transition-opacity z-0">
                    <div className="bg-white p-1 rounded">
                        <QRCodeSVG value={publicProfileUrl} size={40} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 p-4 border-t-4 border-orange-900 relative z-10 flex justify-between items-center">
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Quests</div>
                    <div className="text-lg font-bold text-white">{user.stats?.quests_completed || 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Total XP</div>
                    <div className="text-lg font-bold text-orange-500">{user.stats?.total_xp || 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Achiev.</div>
                    <div className="text-lg font-bold text-white">{user.stats?.achievements_unlocked || 0}</div>
                </div>
            </div>
        </div>
    );

    if (forceFace === 'front') {
        return (
            <div className={`perspective-1000 w-[320px] h-[480px] ${className}`}>
                <div className="relative w-full h-full">
                    {FrontContent}
                </div>
            </div>
        );
    }

    return (
        <div className={`perspective-1000 w-[320px] h-[480px] ${className}`}>
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
        </div>
    );
};

export default CharacterCard;
