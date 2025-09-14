// API Response Types
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'totalLand' | 'likes';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

// My Cases API
export interface MyCasesResponse {
    cases: any[]; // Will be typed with UICaseData later
    stats: {
        totalCases: number;
        totalLand: number;
        averageLandPerCase: number;
    };
    pagination: PaginationMeta;
}

// Community Cases API
export interface CommunityCasesResponse {
    cases: any[]; // Will be typed with UICaseData later
    stats: {
        totalCommunityCases: number;
        totalFarmers: number;
        totalLikes: number;
        averageLikesPerCase: number;
    };
    pagination: PaginationMeta;
}

// Search API
export interface SearchParams extends PaginationParams {
    q?: string; // search query
    season?: string;
    minLand?: number;
    maxLand?: number;
    tags?: string[];
    userId?: string; // to exclude user's own cases
}

export interface SearchResponse {
    cases: any[]; // Will be typed with UICaseData later
    filters: {
        appliedFilters: Partial<SearchParams>;
        availableSeasons: string[];
        availableTags: string[];
    };
    pagination: PaginationMeta;
}

// Error Response
export interface ApiErrorResponse {
    error: string;
    code: string;
    details?: any;
}
