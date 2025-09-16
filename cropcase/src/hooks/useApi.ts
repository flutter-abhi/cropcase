import { useAuthStore } from '@/stores/authStore';
import { useCallback } from 'react';
import { handleApiResponse } from '@/lib/apiUtils';

// Hook for making authenticated API calls
export const useApi = () => {
    const { refreshToken, refreshAuth, getAuthHeaders, logout } = useAuthStore();

    const authenticatedFetch = useCallback(async (
        url: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<unknown> => {
        // Get fresh headers each time (important for retries after refresh)
        const headers = {
            ...getAuthHeaders(),
            ...options.headers,
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401 && refreshToken && retryCount < 1) {
                console.log('Access token expired, attempting to refresh...');
                try {
                    await refreshAuth();
                    console.log('Token refreshed successfully, retrying original request...');
                    // Retry the original request with fresh headers (new token)
                    return authenticatedFetch(url, options, retryCount + 1);
                } catch (refreshError) {
                    console.error('Failed to refresh token, logging out:', refreshError);
                    logout(); // Log out if refresh fails
                    throw new Error('Session expired. Please log in again.');
                }
            }

            return handleApiResponse(response);
        } catch (error) {
            // Don't log every error, just critical ones
            if (error instanceof Error && !error.message.includes('HTTP error')) {
                console.error('Authenticated API call failed:', error);
            }
            throw error;
        }
    }, [refreshToken, refreshAuth, getAuthHeaders, logout]);

    const get = useCallback((url: string, options?: RequestInit) =>
        authenticatedFetch(url, { ...options, method: 'GET' }),
        [authenticatedFetch]
    );

    const post = useCallback((url: string, body: unknown, options?: RequestInit) =>
        authenticatedFetch(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            }
        }),
        [authenticatedFetch]
    );

    const put = useCallback((url: string, body: unknown, options?: RequestInit) =>
        authenticatedFetch(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            }
        }),
        [authenticatedFetch]
    );

    const del = useCallback((url: string, options?: RequestInit) =>
        authenticatedFetch(url, { ...options, method: 'DELETE' }),
        [authenticatedFetch]
    );

    const patch = useCallback((url: string, body: unknown, options?: RequestInit) =>
        authenticatedFetch(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            }
        }),
        [authenticatedFetch]
    );

    return { get, post, put, del, patch, authenticatedFetch };
};

// Hook for making unauthenticated API calls (for login, signup, etc.)
export const usePublicApi = () => {
    const get = async (url: string, options: RequestInit = {}) => {
        return fetch(url, {
            ...options,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
    };

    const post = async (url: string, data?: unknown, options: RequestInit = {}) => {
        return fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    };

    return {
        get,
        post,
    };
};
