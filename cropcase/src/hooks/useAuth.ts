import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
    const router = useRouter();
    const authStore = useAuthStore();

    // Auto-refresh token on app start if we have a refresh token but no access token
    useEffect(() => {
        if (authStore.refreshToken && !authStore.accessToken && !authStore.isLoading) {
            authStore.refreshAuth();
        }
    }, [authStore]);

    const loginWithRedirect = async (email: string, password: string, redirectTo?: string) => {
        try {
            await authStore.login(email, password);

            router.push(redirectTo || '/');
        } catch (error) {
            // Error is handled by the store
            throw error;
        }
    };

    const signupWithRedirect = async (email: string, password: string, name?: string, redirectTo?: string) => {
        try {
            await authStore.signup(email, password, name);
            router.push(redirectTo || '/');
        } catch (error) {
            // Error is handled by the store
            throw error;
        }
    };

    const logoutWithRedirect = async (redirectTo = '/login') => {
        try {
            await authStore.logout();
            router.push(redirectTo);
        } catch {
            // Even if logout fails, clear local state and redirect
            router.push(redirectTo);
        }
    };

    return {
        ...authStore,
        loginWithRedirect,
        signupWithRedirect,
        logoutWithRedirect,
    };
};

// Hook for protected routes
export const useRequireAuth = (redirectTo = '/login') => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    return { isAuthenticated, isLoading };
};

// Hook for making authenticated API calls
export const useAuthenticatedFetch = () => {
    const { getAuthHeaders, refreshAuth, isAuthenticated } = useAuthStore();

    const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }

        const headers = {
            ...getAuthHeaders(),
            ...options.headers,
        };

        let response = await fetch(url, {
            ...options,
            headers,
        });

        // If we get a 401, try to refresh the token and retry
        if (response.status === 401) {
            try {
                await refreshAuth();

                // Retry with new token
                const newHeaders = {
                    ...getAuthHeaders(),
                    ...options.headers,
                };

                response = await fetch(url, {
                    ...options,
                    headers: newHeaders,
                });
            } catch {
                // If refresh fails, user needs to login again
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    };

    return { authenticatedFetch };
};

// Hook for checking if user has specific role
export const useRole = () => {
    const { user } = useAuth();

    const hasRole = (role: 'USER' | 'ADMIN' | 'MODERATOR') => {
        return user?.role === role;
    };

    const isAdmin = () => hasRole('ADMIN');
    const isModerator = () => hasRole('MODERATOR');
    const isUser = () => hasRole('USER');

    return {
        role: user?.role,
        hasRole,
        isAdmin,
        isModerator,
        isUser,
    };
};
