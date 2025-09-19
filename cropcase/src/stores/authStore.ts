import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';
import { hashPasswordForAuth } from '@/lib/crypto';


// Enhanced refresh token management with queuing system
let refreshPromise: Promise<{ accessToken: string; refreshToken: string; user: User }> | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(tokens: { accessToken: string; refreshToken: string; user: User }) => void> = [];
let lastRefreshTime = 0;

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
                    // Hash password using Web Crypto API
                    const hashedPassword = await hashPasswordForAuth(password);

                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: hashedPassword }),
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
                    // Hash password using Web Crypto API
                    const hashedPassword = await hashPasswordForAuth(password);

                    const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: hashedPassword, name }),
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

            // Enhanced refresh token with queuing system
            refreshAuth: async (): Promise<{ accessToken: string; refreshToken: string; user: User } | void> => {
                const now = Date.now();
                console.log('🔄 refreshAuth called');

                // If a refresh is already in progress, return the existing promise
                if (isRefreshing && refreshPromise) {
                    console.log('⏳ Refresh already in progress, waiting for completion...');
                    return refreshPromise;
                }

                // Prevent rapid successive refreshes (minimum 5 seconds between calls)
                if (now - lastRefreshTime < 5 * 1000) {
                    console.log('⏳ Refresh called too soon, skipping to prevent loop');
                    return;
                }

                const { refreshToken, user: currentUser } = get();

                if (!refreshToken) {
                    console.log('❌ No refresh token found locally, logging out...');
                    set({ isAuthenticated: false });
                    return;
                }

                // Set refreshing flag and loading state
                isRefreshing = true;
                set({ isLoading: true, error: null });

                // Create refresh promise with proper error handling and queuing
                refreshPromise = (async () => {
                    try {
                        console.log('🔄 Making refresh token request...');
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
                        console.log('✅ Token refresh successful');

                        // Validate that the returned user matches current user (if any)
                        if (currentUser && data.user && currentUser.id !== data.user.id) {
                            console.warn('⚠️ User mismatch detected during refresh - logging out for security');
                            throw new Error('User session mismatch detected');
                        }

                        // Update state atomically
                        set({
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            user: data.user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });

                        console.log('✅ Auth state updated successfully');

                        // Update last refresh time
                        lastRefreshTime = Date.now();

                        // Notify all subscribers waiting for the refresh
                        refreshSubscribers.forEach(callback => {
                            try {
                                callback({
                                    accessToken: data.accessToken,
                                    refreshToken: data.refreshToken,
                                    user: data.user
                                });
                            } catch (err) {
                                console.error('Error notifying refresh subscriber:', err);
                            }
                        });
                        refreshSubscribers = [];

                        return {
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            user: data.user
                        };

                    } catch (error) {
                        console.error('❌ Token refresh failed:', error);

                        // Clear all subscribers on error
                        refreshSubscribers = [];

                        const isUserMismatch = error instanceof Error && error.message.includes('User session mismatch');
                        const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';

                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: errorMessage
                        });

                        if (isUserMismatch) {
                            console.log('🔒 User mismatch - forcing logout for security');
                        }

                        throw error; // Re-throw to be caught by subscribers
                    } finally {
                        // Always clear the refresh promise and flag
                        refreshPromise = null;
                        isRefreshing = false;
                        // Update last refresh time even on error to prevent rapid retries
                        lastRefreshTime = Date.now();
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

            // Enhanced token-user consistency validation with detailed logging
            validateTokenUserConsistency: () => {
                const { accessToken, user } = get();

                if (!accessToken) {
                    console.log('🔍 No access token to validate');
                    return true; // No token is valid state
                }

                if (!user) {
                    console.warn('⚠️ Access token exists but no user data - invalid state');
                    return false;
                }

                try {
                    // Decode JWT payload
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));

                    console.log('🔍 Token validation details:', {
                        'JWT payload': payload,
                        'Stored user': user
                    });

                    console.log('🔍 Security Check Process:');
                    console.log('   1. Decoded JWT token from access token');
                    console.log('   2. Extracted user ID and email from token');
                    console.log('   3. Comparing with stored user data');
                    console.log('   4. Checking for user ID match');
                    console.log('   5. Checking for email match');
                    console.log('   6. Validating token expiry');

                    // Comprehensive validation
                    const tokenUserId = payload.userId;
                    const tokenEmail = payload.email;
                    const storedUserId = user.id;
                    const storedEmail = user.email;

                    console.log('🔍 Comparing IDs and emails:', {
                        tokenUserId,
                        storedUserId,
                        tokenEmail,
                        storedEmail,
                        userIdMatch: tokenUserId === storedUserId,
                        emailMatch: tokenEmail === storedEmail
                    });

                    // Check user ID match
                    if (tokenUserId !== storedUserId) {
                        console.error('🚨 CRITICAL: Token user ID mismatch!', {
                            tokenUserId,
                            storedUserId,
                            tokenEmail,
                            storedEmail,
                            message: 'This means the access token belongs to a different user than the one stored in the app state!'
                        });
                        return false;
                    }

                    // Check email match for additional security
                    if (tokenEmail !== storedEmail) {
                        console.error('🚨 CRITICAL: Token email mismatch!', {
                            tokenEmail,
                            storedEmail,
                            message: 'Token email does not match stored user email!'
                        });
                        return false;
                    }

                    // Check token expiry
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (payload.exp && payload.exp < currentTime) {
                        console.warn('⚠️ Access token is expired', {
                            expiry: new Date(payload.exp * 1000),
                            now: new Date()
                        });
                        return false;
                    }

                    console.log('✅ Token-user consistency validated successfully');
                    return true;
                } catch (error) {
                    console.error('❌ Error validating token-user consistency:', error);
                    console.error('❌ Token structure might be invalid:', accessToken?.substring(0, 50) + '...');
                    return false;
                }
            },

            // Get fresh access token (for API calls) - handles concurrent refresh with validation
            getFreshAccessToken: async (): Promise<string | null> => {
                const { accessToken, refreshToken, validateTokenUserConsistency } = get();

                console.log('🔍 getFreshAccessToken called');

                if (!accessToken && !refreshToken) {
                    console.log('❌ No tokens available');
                    return null;
                }

                // CRITICAL: Always validate token-user consistency first
                if (accessToken && !validateTokenUserConsistency()) {
                    console.error('🚨 Token-user mismatch in getFreshAccessToken - this is a security issue!');

                    // Check if refresh token also belongs to wrong user
                    if (refreshToken) {
                        try {
                            // Decode refresh token to check if it matches stored user
                            const refreshPayload = JSON.parse(atob(refreshToken.split('.')[1]));
                            const { user } = get();

                            if (user && refreshPayload.userId !== user.id) {
                                console.error('🚨 CRITICAL: Both access and refresh tokens belong to wrong user - forcing complete logout');
                                console.error('🚨 This indicates a serious security breach or token manipulation');

                                // Force complete logout with detailed error message
                                set({
                                    user: null,
                                    accessToken: null,
                                    refreshToken: null,
                                    isAuthenticated: false,
                                    isLoading: false,
                                    error: 'Security Alert: Your session has been terminated due to token manipulation detected. Please login again for security.'
                                });

                                return null;
                            }

                            console.log('🔄 Refresh token belongs to correct user, attempting refresh...');
                            const result = await get().refreshAuth();
                            return result?.accessToken || null;
                        } catch (error) {
                            console.error('Failed to refresh token after validation failure:', error);
                            console.error('🚨 Forcing logout due to token validation failure');

                            // Force logout on any error
                            set({
                                user: null,
                                accessToken: null,
                                refreshToken: null,
                                isAuthenticated: false,
                                isLoading: false,
                                error: 'Security Alert: Token validation failed. Your session has been terminated for security. Please login again.'
                            });

                            return null;
                        }
                    } else {
                        console.error('🚨 No refresh token available for security recovery - forcing logout');
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: 'Security Alert: No valid refresh token available. Your session has been terminated. Please login again.'
                        });
                        return null;
                    }
                }

                // Check if token is expired or about to expire (within 5 minutes)
                if (accessToken) {
                    try {
                        const payload = JSON.parse(atob(accessToken.split('.')[1]));
                        const expiryTime = payload.exp * 1000;
                        const currentTime = Date.now();
                        const timeUntilExpiry = expiryTime - currentTime;

                        // If token is still valid for more than 5 minutes, return it
                        if (timeUntilExpiry > 5 * 60 * 1000) {
                            console.log('✅ Access token is valid, returning');
                            return accessToken;
                        }

                        console.log('🔄 Access token expires soon, refreshing...');
                    } catch (error) {
                        console.error('Error parsing JWT token:', error);
                    }
                }

                // Token is expired or about to expire, refresh it
                if (refreshToken) {
                    try {
                        console.log('🔄 Refreshing token to get fresh access token');
                        const result = await get().refreshAuth();
                        return result?.accessToken || null;
                    } catch (error) {
                        console.error('Failed to refresh token:', error);
                        return null;
                    }
                }

                return null;
            },

            // Subscribe to token refresh (for concurrent API calls)
            subscribeToTokenRefresh: (callback: (tokens: { accessToken: string; refreshToken: string; user: User }) => void): void => {
                if (isRefreshing) {
                    refreshSubscribers.push(callback);
                } else {
                    // If not refreshing, call immediately with current tokens
                    const { accessToken, refreshToken, user } = get();
                    if (accessToken && refreshToken && user) {
                        callback({ accessToken, refreshToken, user });
                    }
                }
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
