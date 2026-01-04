import { 
    Brain, 
    Sword, 
    Coins, 
    Leaf, 
    Briefcase, 
    Users, 
    Heart, 
    Sparkles, 
    Scroll,
    type LucideIcon
} from 'lucide-react';

export const dimensionIcons: Record<string, LucideIcon> = {
    intellectual: Brain,
    physical: Sword,
    financial: Coins,
    environmental: Leaf,
    vocational: Briefcase,
    social: Users,
    emotional: Heart,
    spiritual: Sparkles,
    default: Scroll
};

export const getDimensionIcon = (dimension: string): LucideIcon => {
    const normalizedDimension = dimension.toLowerCase();
    return dimensionIcons[normalizedDimension] || dimensionIcons.default;
};
