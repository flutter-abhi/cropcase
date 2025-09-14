// Form-related type definitions

export interface FormData {
    name: string;
    description: string;
    totalLand: number;
    location: string;
    startDate: string;
    endDate: string;
    budget: number;
    isPublic: boolean;
    tags: string[];
    crops: Array<{
        id: string;      // Added crop ID
        name: string;
        weight: number;
        season: string;
    }>;
    notes: string;
}
