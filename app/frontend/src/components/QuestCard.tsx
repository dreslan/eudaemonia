import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowRight, RotateCw } from 'lucide-react';
import type { Quest } from '../types';
import { dimensionColors } from '../utils/colors';
import { getAsciiArt } from '../utils/ascii';

interface QuestCardProps {
    quest: Quest;
    className?: string;
    forceFace?: 'front' | 'back';
    hideActions?: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({ 
    quest, 
    className = '',
    forceFace,
    hideActions = false
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const dimension = quest.dimension || 'default';
    const colorClass = dimensionColors[dimension] || dimensionColors.default;
    const borderColor = colorClass.split(' ')[1].replace('border-', '');
    const bgColor = colorClass.split(' ')[0].replace('bg-', '');
    const questUrl = `${window.location.origin}/quests/${quest.id}`;
    const asciiArt = getAsciiArt(dimension);

    const handlePrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/print/quests/${quest.id}`, '_blank');
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
            <div className={`w-full h-full rounded-2xl overflow-hidden bg-${bgColor}-900 border-[12px] border-${borderColor}-900 shadow-2xl flex flex-col relative`}>
                {/* Pattern Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] -rotate-45 opacity-10 flex items-center justify-center">
                        <p className={`text-[10px] font-black uppercase text-${borderColor}-200 tracking-widest leading-relaxed text-center w-full break-words`}>
                            {Array.from({ length: 800 }).fill("QUEST LOG").join(" ")}
                        </p>
                    </div>
                </div>

                {/* Header */}
                <div className={`bg-gray-900 p-4 border-b-4 border-${borderColor}-700 relative z-10 text-center shadow-md`}>
                    <h3 className={`font-['Cinzel'] font-black text-xl text-${borderColor}-400 tracking-widest drop-shadow-md`}>QUEST LOG</h3>
                </div>

                {/* Body - QR Code */}
                <div className="flex-1 flex items-center justify-center relative z-10 p-4">
                    <div className="bg-white p-3 rounded-xl shadow-2xl border-4 border-gray-900">
                        <QRCodeSVG value={questUrl} size={160} />
                    </div>
                </div>
                
                {/* Footer */}
                <div className={`bg-gray-900 p-4 border-t-4 border-${borderColor}-700 relative z-10 text-center shadow-md`}>
                    <h3 className={`font-['Cinzel'] font-black text-xl text-${borderColor}-400 tracking-widest drop-shadow-md`}>QUEST LOG</h3>
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

        // Default to Front (or 3D wrapper if no forceFace)
        const FrontContent = (
            <div className={`absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-gray-900 text-white flex flex-col border-[12px] border-${borderColor}-900 shadow-2xl ${forceFace ? 'relative w-full h-full' : ''}`}>
                {/* Inner Border */}
                <div className={`absolute inset-0 border-[2px] border-${borderColor}-400/50 rounded-lg pointer-events-none z-20`}></div>
                
                {/* Header */}
                <div className={`bg-gradient-to-b from-${bgColor}-800 to-${bgColor}-900 p-3 border-b-4 border-${borderColor}-700 relative z-10`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-['Cinzel'] font-bold text-lg leading-tight text-white drop-shadow-md truncate">
                                {quest.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/30 text-${borderColor}-200 border border-${borderColor}-500/30`}>
                                    {dimension}
                                </span>
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
                <div className="h-48 bg-black relative overflow-hidden border-b-4 border-${borderColor}-700 group-hover:brightness-110 transition-all duration-500">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
                        <pre className="text-[8px] leading-[8px] font-mono text-${borderColor}-200 whitespace-pre">
                            {asciiArt}
                        </pre>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>

                {/* Body */}
                <div className="flex-1 p-4 relative bg-gray-900">
                    {/* Text Box */}
                    <div className="h-full border border-gray-700 bg-gray-800/50 rounded p-3 relative">
                        <div className="absolute -top-3 left-3 bg-gray-900 px-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            Victory Condition
                        </div>
                        <p className="font-['Cormorant_Garamond'] text-xl leading-snug text-gray-200 italic">
                            "{quest.victory_condition || "Survive."}"
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className={`bg-gray-900 p-3 border-t-2 border-${borderColor}-900 flex justify-between items-center relative z-10`}>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Status</span>
                        <span className={`text-xs font-bold uppercase ${quest.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                            {quest.status}
                        </span>
                    </div>
                    
                    <div className="flex gap-3 print:hidden">
                        {!hideActions && (
                            <>
                                <button 
                                    onClick={handlePrint}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Print Card"
                                >
                                    <Printer size={18} />
                                </button>
                                <Link 
                                    to={`/quests/${quest.id}`}
                                    className="text-${borderColor}-400 hover:text-${borderColor}-200 transition-colors"
                                    title="View Details"
                                >
                                    <ArrowRight size={18} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );

        if (forceFace === 'front') return FrontContent;

        return (
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {FrontContent}
                
                {/* BACK (3D Mode) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
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

export default QuestCard;
