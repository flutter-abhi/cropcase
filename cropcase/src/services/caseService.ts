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

export const createCase = async (data: any): Promise<ApiCaseResponse> => {
    const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const getCases = async (): Promise<ApiCaseResponse[]> => {
    const response = await fetch('/api/cases');

    if (!response.ok) {
        throw new Error(`Failed to fetch cases: ${response.status}`);
    }

    return response.json();
};

export const getCaseById = async (id: string): Promise<ApiCaseResponse> => {
    const response = await fetch(`/api/cases/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch case: ${response.status}`);
    }

    return response.json();
};

export const updateCase = async (id: string, data: Partial<any>): Promise<ApiCaseResponse> => {
    const response = await fetch(`/api/cases/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Failed to update case: ${response.status}`);
    }

    return response.json();
};

export const deleteCase = async (id: string): Promise<void> => {
    const response = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete case: ${response.status}`);
    }
};
