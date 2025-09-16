// Types for API responses
export interface ApiCaseResponse {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    totalLand: number;
    location: string | null;
    isPublic: boolean;
    startDate: string | null;
    endDate: string | null;
    budget: number | null;
    notes: string | null;
    status: string;
    efficiency: number | null;
    estimatedProfit: number | null;
    views: number;
    tags: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    crops: Array<{
        id: string;
        weight: number;
        notes: string | null;
        crop: {
            id: string;
            name: string;
            season: string;
        };
    }>;
    likes: Array<{
        id: string;
        userId: string;
    }>;
}

// Input types for API operations
export interface CreateCaseRequest {
    userId: string;
    name: string;
    description?: string;
    totalLand: number;
    location?: string;
    isPublic: boolean;
    startDate?: string;
    endDate?: string;
    budget?: number;
    notes?: string;
    status: string;
    tags?: string;
    efficiency?: number;
    estimatedProfit?: number;
    crops: Array<{
        cropId: string;
        weight: number;
        notes?: string;
    }>;
}

export interface UpdateCaseRequest {
    name?: string;
    description?: string;
    totalLand?: number;
    location?: string;
    isPublic?: boolean;
    startDate?: string;
    endDate?: string;
    budget?: number;
    notes?: string;
    status?: string;
    tags?: string;
    efficiency?: number;
    estimatedProfit?: number;
}

export const createCase = async (data: CreateCaseRequest): Promise<ApiCaseResponse> => {
    try {
        const response = await fetch('/api/cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to create case: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while creating the case');
    }
};

export const getCases = async (): Promise<ApiCaseResponse[]> => {
    try {
        const response = await fetch('/api/cases');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch cases: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching cases');
    }
};

export const getCaseById = async (id: string): Promise<ApiCaseResponse> => {
    try {
        const response = await fetch(`/api/cases/${id}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch case: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching the case');
    }
};

export const updateCase = async (id: string, data: UpdateCaseRequest): Promise<ApiCaseResponse> => {
    try {
        const response = await fetch(`/api/cases/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to update case: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while updating the case');
    }
};

export const deleteCase = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`/api/cases/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to delete case: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while deleting the case');
    }
};
