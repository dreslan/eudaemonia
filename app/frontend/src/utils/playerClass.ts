import type { User, Dimension } from '../types';

export const getPlayerClass = (user: User): { className: string; description: string } => {
    if (!user.dimension_stats || user.dimension_stats.length === 0) {
        return { className: "Novice", description: "A blank canvas with infinite potential." };
    }

    // Find dimension with max level
    let maxLevel = -1;
    let maxDimension: Dimension | null = null;

    user.dimension_stats.forEach(stat => {
        if (stat.level > maxLevel) {
            maxLevel = stat.level;
            maxDimension = stat.dimension;
        }
    });

    if (!maxDimension) {
        return { className: "Novice", description: "Just getting started." };
    }

    // Check for balance (Polymath) - if top 3 stats are within 2 levels of each other and level > 5
    // For simplicity, let's just stick to the dominant trait for now.

    switch (maxDimension) {
        case 'physical':
            return { className: "Juggernaut", description: "A relentless force of nature." };
        case 'intellectual':
            return { className: "Mastermind", description: "Knowledge is the ultimate weapon." };
        case 'financial':
            return { className: "Tycoon", description: "Resources are meant to be leveraged." };
        case 'vocational':
            return { className: "Specialist", description: "Precision and expertise in every action." };
        case 'social':
            return { className: "Emissary", description: "Words can open doors that keys cannot." };
        case 'emotional':
            return { className: "Sentinel", description: "Unshakable resolve in the face of chaos." };
        case 'environmental':
            return { className: "Warden", description: "Master of their domain and surroundings." };
        case 'spiritual':
            return { className: "Ascendant", description: "Seeing beyond the veil of the mundane." };
        default:
            return { className: "Seeker", description: "Forging their own path." };
    }
};
