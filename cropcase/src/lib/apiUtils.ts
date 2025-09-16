// Utility functions for API calls
import { ApiErrorResponse } from '@/types/api';

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

// Parse API response and handle errors
export const parseApiResponse = async <T = unknown>(
    response: Response
): Promise<ApiResponse<T>> => {
    try {
        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.error || `HTTP ${response.status}: ${response.statusText}`,
                data: undefined,
            };
        }

        return {
            data,
            error: undefined,
        };
    } catch {
        return {
            error: 'Failed to parse response',
            data: undefined,
        };
    }
};

// Create standardized API error
export const createApiError = (error: string, status: number = 500, details?: unknown): ApiErrorResponse => {
    return {
        error,
        code: `ERROR_${status}`,
        details,
    };
};

// Handle API errors consistently
export const handleApiError = (error: unknown): ApiErrorResponse => {
    if (error instanceof Error) {
        return createApiError(error.message);
    }

    if (typeof error === 'string') {
        return createApiError(error);
    }

    return createApiError('An unexpected error occurred');
};

// Check if response is successful
export const isApiSuccess = (response: Response): boolean => {
    return response.ok && response.status >= 200 && response.status < 300;
};

// Get error message from API response
export const getApiErrorMessage = (response: ApiResponse): string => {
    return response.error || 'An unexpected error occurred';
};

// Handle API response and parse JSON (for useApi hook)
export async function handleApiResponse(response: Response): Promise<unknown> {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            // If response is not JSON, use status text
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
        }
        throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
    }
    return response.json();
}
