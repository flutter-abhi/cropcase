import { useAuthStore } from '@/stores/authStore';
import { useCallback } from 'react';
import { handleApiResponse, apiFetch } from '@/lib/apiUtils';

// Hook for making authenticated API calls
export const useApi = () => {
    const { getFreshAccessToken, logout } = useAuthStore();

    const authenticatedFetch = useCallback(async (
        url: string,
        options: RequestInit = {}
    ): Promise<unknown> => {
        try {
            console.log('🌐 Making authenticated API call to:', url);

            // Use the enhanced apiFetch with automatic token refresh
            const response = await apiFetch(url, options, getFreshAccessToken);

            // If we still get 401 after token refresh attempt, user needs to login
            if (response.status === 401) {
                console.log('❌ Still got 401 after token refresh attempt - logging out');
                logout();
                throw new Error('Session expired. Please log in again.');
            }

            return handleApiResponse(response);
        } catch (error) {
            // Don't log every error, just critical ones
            if (error instanceof Error && !error.message.includes('HTTP error')) {
                console.error('❌ Authenticated API call failed:', error);
            }
            throw error;
        }
    }, [getFreshAccessToken, logout]);

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
