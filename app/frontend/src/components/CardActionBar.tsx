import React from 'react';
import { Play, CheckCircle, Eye, EyeOff, Share2, Printer, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Status } from '../types';

interface CardActionBarProps {
    type: 'quest' | 'achievement' | 'character';
    id: string;
    status?: Status; // Only for quests
    isHidden?: boolean;
    onStatusChange?: (newStatus: Status) => void;
    onVisibilityChange?: (isHidden: boolean) => void;
    onDelete?: () => void;
    showStatusActions?: boolean;
    showDelete?: boolean;
    isPublicView?: boolean;
}

const CardActionBar: React.FC<CardActionBarProps> = ({
    type,
    id,
    status,
    isHidden = false,
    onStatusChange,
    onVisibilityChange,
    onDelete,
    showStatusActions = true,
    showDelete = false,
    isPublicView = false
}) => {
    const baseUrl = window.location.origin;
    const shareUrl = type === 'character' 
        ? `${baseUrl}/public/profile/${id}` // Assuming id is username for character
        : `${baseUrl}/public/${type}s/${id}`;

    const handleShare = () => {
        navigator.clipboard.writeText(shareUrl);
        alert("Public link copied to clipboard!");
    };

    const handlePrint = () => {
        const printPath = type === 'character' ? '/print/character' : `/print/${type}s/${id}`;
        window.open(printPath, '_blank');
    };

    if (isPublicView) {
        return (
            <div className="w-[320px] flex items-center justify-end px-2 py-2 bg-white dark:bg-dcc-card border-t dark:border-gray-700 rounded-b-lg shadow-sm mt-[-8px] relative z-20">
                 <button
                    onClick={handlePrint}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Print Card"
                >
                    <Printer className="w-4 h-4" />
                </button>
                {type !== 'character' && (
                    <Link
                        to={`/public/${type}s/${id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="View Details"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="w-[320px] flex items-center justify-between px-2 py-2 bg-white dark:bg-dcc-card border-t dark:border-gray-700 rounded-b-lg shadow-sm mt-[-8px] relative z-20">
            {/* Left Side: Status Actions */}
            <div className="flex items-center gap-2">
                {type === 'quest' && showStatusActions && status && (
                    <>
                        {status === 'backlog' && (
                            <button
                                onClick={() => onStatusChange?.('active')}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors"
                                title="Start Quest"
                            >
                                <Play className="w-5 h-5" />
                            </button>
                        )}
                        {status === 'active' && (
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to complete this quest? This cannot be undone.")) {
                                        onStatusChange?.('completed');
                                    }
                                }}
                                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-full transition-colors"
                                title="Complete Quest"
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        )}
                        {status === 'completed' && (
                            <span className="p-2 text-gray-400 cursor-default" title="Completed">
                                <CheckCircle className="w-5 h-5" />
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Right Side: Utility Actions */}
            <div className="flex items-center gap-1">
                {type !== 'character' && (
                    <button
                        onClick={() => onVisibilityChange?.(!isHidden)}
                        className={`p-2 rounded-full transition-colors ${
                            isHidden 
                            ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title={isHidden ? "Hidden from public" : "Visible to public"}
                    >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}

                <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Share Link"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                <button
                    onClick={handlePrint}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Print Card"
                >
                    <Printer className="w-4 h-4" />
                </button>

                {type !== 'character' && (
                    <Link
                        to={`/${type}s/${id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="View Details"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
                
                {showDelete && onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CardActionBar;
