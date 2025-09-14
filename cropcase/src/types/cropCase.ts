import { Crop } from './crop';

// User interface
export interface User {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// Like interface
export interface Like {
    id: string;
    caseId: string;
    userId: string;
}

// CaseCrop interface
export interface CaseCrop {
    id: string;
    caseId: string;
    cropId: string;
    weight: number;
    notes: string | null;
    crop: Crop;
}

// Single CropCase interface - matches Prisma schema + UI needs
export interface CropCase {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    totalLand: number;
    location: string | null;
    isPublic: boolean;
    startDate: Date | null;
    endDate: Date | null;
    budget: number | null;
    notes: string | null;
    status: 'active' | 'completed' | 'paused';
    efficiency: number | null;
    estimatedProfit: number | null;
    views: number;
    tags: string; // JSON string from Prisma
    createdAt: Date;
    updatedAt: Date;

    // Relations
    user: User;
    crops: CaseCrop[];
    likes: Like[];

    // UI-only field (calculated, not in DB)
    isOwner?: boolean;
}