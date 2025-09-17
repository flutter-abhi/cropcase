// UI-specific types that components use
export interface UICaseData {
    id: string;
    name: string;
    crops: Array<{
        id?: string; // Optional for backward compatibility
        name: string;
        weight: number;
        season: string;
    }>;
    user: {
        name: string;
        email: string;
    };
    createdAt: Date;
    totalLand: number;
    isOwner: boolean;
    // Optional fields for community features
    likes?: number;
    isLiked?: boolean;
    views?: number;
    location?: string;
    description?: string;
    tags?: string[];
    efficiency?: number;
    estimatedProfit?: number;
    status?: string;
}
