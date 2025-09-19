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

// Enhanced API fetch with automatic token refresh and retry logic
export async function apiFetch(
    url: string,
    options: RequestInit = {},
    getFreshToken: () => Promise<string | null>
): Promise<Response> {
    const makeRequest = async (token?: string): Promise<Response> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };

    // First attempt with current token
    const token = await getFreshToken();
    let response = await makeRequest(token || undefined);

    // If we get 401, try to refresh token and retry once
    if (response.status === 401 && token) {
        console.log('🔄 Got 401, attempting token refresh and retry...');

        try {
            const freshToken = await getFreshToken();
            if (freshToken && freshToken !== token) {
                console.log('✅ Got fresh token, retrying request...');
                response = await makeRequest(freshToken);
            } else {
                console.log('❌ Could not get fresh token or token unchanged');
            }
        } catch (error) {
            console.error('❌ Token refresh failed during API call:', error);
            // Return original 401 response
        }
    }

    return response;
}