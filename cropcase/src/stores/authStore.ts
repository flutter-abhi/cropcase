import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';


// Add refresh lock to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login
            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Login failed');
                    }

                    const data = await response.json();

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Login failed',
                    });
                    throw error;
                }
            },

            // Signup
            signup: async (email: string, password: string, name?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, name }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Signup failed');
                    }

                    const data = await response.json();

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Signup failed',
                    });
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                const { refreshToken } = get();

                try {
                    if (refreshToken) {
                        await fetch('/api/auth/logout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken }),
                        });
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            // Refresh token
            refreshAuth: async () => {
                // If a refresh is already in progress, wait for it
                if (refreshPromise) {
                    console.log('Refresh already in progress, waiting...');
                    return refreshPromise;
                }

                const { refreshToken } = get();

                if (!refreshToken) {
                    set({ isAuthenticated: false });
                    return;
                }

                set({ isLoading: true }); // Set loading state

                // Create refresh promise to prevent multiple simultaneous refreshes
                refreshPromise = (async () => {

                    try {
                        const response = await fetch('/api/auth/refresh', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken }),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || 'Token refresh failed');
                        }

                        const data = await response.json();

                        // Update state atomically
                        set({
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            user: data.user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });

                        // Small delay to ensure state is propagated
                        await new Promise(resolve => setTimeout(resolve, 100));

                    } catch (error) {
                        console.error('Token refresh failed:', error);
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error instanceof Error ? error.message : 'Token refresh failed'
                        });
                        throw error; // Re-throw to be caught by useApi if needed
                    } finally {
                        // Clear the refresh promise
                        refreshPromise = null;
                    }
                })();

                return refreshPromise;
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Set user (useful for AuthProvider)
            setUser: (user: User) => set({ user }),

            // Update profile
            updateProfile: async (data: Partial<User>) => {
                set({ isLoading: true, error: null });

                try {
                    const { accessToken } = get();

                    if (!accessToken) {
                        throw new Error('Not authenticated');
                    }

                    const response = await fetch('/api/auth/me', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Profile update failed');
                    }

                    const updatedUser = await response.json();

                    set({
                        user: updatedUser.user,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Profile update failed',
                    });
                    throw error;
                }
            },

            // Get auth headers for API calls
            getAuthHeaders: (): Record<string, string> => {
                const { accessToken } = get();

                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };

                if (accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                return headers;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
