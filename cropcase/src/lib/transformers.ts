import { CropCase } from '@/types/cropCase';
import { UICaseData } from '@/types/ui';
import { ApiCaseResponse } from '@/services/caseService';

export const transformCropCaseToUI = (cropCase: CropCase): UICaseData => {
    return {
        id: cropCase.id,
        name: cropCase.name,
        crops: cropCase.crops.map(cc => ({
            name: cc.crop.name,
            weight: cc.weight,
            season: cc.crop.season
        })),
        user: {
            name: cropCase.user.name || "Unknown User",
            email: cropCase.user.email
        },
        createdAt: cropCase.createdAt,
        totalLand: cropCase.totalLand,
        isOwner: cropCase.isOwner || false,
        likes: cropCase.likes.length,
        views: cropCase.views,
        location: cropCase.location || undefined,
        description: cropCase.description || undefined,
        tags: cropCase.tags ? cropCase.tags.split(',').filter(tag => tag.trim()) : []
    };
};

// New transformer for API responses
export const transformApiCaseToUI = (apiCase: ApiCaseResponse, currentUserId?: string): UICaseData => {
    return {
        id: apiCase.id,
        name: apiCase.name,
        crops: apiCase.crops.map(cc => ({
            name: cc.crop.name,
            weight: cc.weight,
            season: cc.crop.season
        })),
        user: {
            name: apiCase.user.name || "Unknown User",
            email: apiCase.user.email
        },
        createdAt: new Date(apiCase.createdAt),
        totalLand: apiCase.totalLand,
        isOwner: currentUserId ? apiCase.userId === currentUserId : false,
        likes: apiCase.likes.length,
        views: apiCase.views,
        location: apiCase.location || undefined,
        description: apiCase.description || undefined,
        tags: apiCase.tags ? apiCase.tags.split(',').filter(tag => tag.trim()) : []
    };
};

// Transform multiple API cases to UI format
export const transformApiCasesToUI = (apiCases: ApiCaseResponse[], currentUserId?: string): UICaseData[] => {
    return apiCases.map(apiCase => transformApiCaseToUI(apiCase, currentUserId));
};
