'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { SecurityAlert } from '@/components/SecurityAlert';

// Provider component to handle authentication initialization
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { refreshAuth, isAuthenticated, refreshToken, accessToken, isLoading, validateTokenUserConsistency, error, clearError } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    // CRITICAL: Validate tokens only once on initial mount
    useEffect(() => {
        console.log('🔍 AuthProvider: Initial mount - validating tokens immediately');
        const hasRefreshToken = !!refreshToken;
        const hasAccessToken = !!accessToken;

        if (hasAccessToken) {
            console.log('🔍 Validating access token consistency...');
            if (!validateTokenUserConsistency()) {
                console.error('🚨 SECURITY ALERT: Token-user mismatch detected on mount!');
                refreshAuth().catch(error => {
                    console.error('Failed to refresh after security mismatch:', error);
                });
                return;
            }
        }

        if (hasRefreshToken) {
            console.log('🔄 Refresh token found - validating session');
            refreshAuth().catch(error => {
                console.error('Failed to validate session on mount:', error);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally empty to prevent infinite loops

    // Monitor access token changes for security validation
    useEffect(() => {
        if (accessToken) {
            console.log('🔍 Access token changed - validating consistency');
            if (!validateTokenUserConsistency()) {
                console.error('🚨 SECURITY ALERT: Token-user mismatch detected!');
                console.error('🚨 This usually means:');
                console.error('   1. Someone manually changed your access token');
                console.error('   2. Your team lead swapped tokens for testing');
                console.error('   3. There was a token storage corruption');
                console.log('🔄 Attempting to resolve security issue...');

                // The getFreshAccessToken will handle the security validation
                // and force logout if both tokens belong to wrong user
                refreshAuth().catch(error => {
                    console.error('Failed to resolve security issue:', error);
                    console.error('🚨 User will be logged out for security');
                });
            }
        }
    }, [accessToken, validateTokenUserConsistency, refreshAuth]);

    // Handle initialization and page refresh scenarios
    useEffect(() => {
        const initializeAuth = async () => {
            const isPageRefresh = performance.navigation?.type === 1; // 1 = reload
            const hasRefreshToken = !!refreshToken;
            const hasAccessToken = !!accessToken;

            console.log('🔍 AuthProvider: Checking auth state', {
                isPageRefresh,
                hasRefreshToken,
                hasAccessToken,
                isAuthenticated,
                isLoading
            });

            // Always refresh on page reload for security
            if (isPageRefresh && hasRefreshToken && !isLoading) {
                try {
                    console.log('🔄 Page refresh detected - refreshing token for security');
                    await refreshAuth();
                } catch (error) {
                    console.error('AuthProvider: Failed to refresh token on page refresh:', error);
                }
            }
            // If we have refresh token but no access token
            else if (hasRefreshToken && !hasAccessToken && !isAuthenticated && !isLoading) {
                try {
                    console.log('🔄 No access token found - refreshing token');
                    await refreshAuth();
                } catch (error) {
                    console.error('AuthProvider: Failed to refresh token on init:', error);
                }
            }

            setIsInitialized(true);
        };

        if (!isInitialized) {
            initializeAuth();
        }
    }, [refreshToken, accessToken, isAuthenticated, isLoading, refreshAuth, isInitialized]);

    useEffect(() => {
        // Set up automatic token refresh before expiry
        if (accessToken && isInitialized) {
            try {
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const expiryTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeUntilExpiry = expiryTime - currentTime;

                // Refresh token 5 minutes before expiry (but at least 1 minute from now)
                const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000);

                if (refreshTime > 0 && timeUntilExpiry > 0) {
                    console.log(`⏰ Setting up auto-refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`);
                    const timeoutId = setTimeout(() => {
                        console.log('⏰ Auto-refresh timer triggered');
                        refreshAuth().catch(error => {
                            console.error('Auto-refresh failed:', error);
                        });
                    }, refreshTime);

                    return () => {
                        console.log('⏰ Clearing auto-refresh timer');
                        clearTimeout(timeoutId);
                    };
                } else if (timeUntilExpiry <= 0) {
                    // Token is already expired, refresh immediately
                    console.log('⏰ Token is already expired, refreshing immediately');
                    refreshAuth().catch(error => {
                        console.error('Immediate refresh failed:', error);
                    });
                }
            } catch (error) {
                console.error('Error parsing JWT token for auto-refresh:', error);
            }
        }
    }, [accessToken, refreshAuth, isInitialized]);

    // Periodic security validation check (less frequent to avoid loops)
    useEffect(() => {
        if (!isInitialized || !accessToken) return;

        console.log('🔒 Setting up periodic security validation');

        let lastCheckTime = 0;

        const securityCheck = () => {
            const now = Date.now();
            // Prevent rapid successive checks (minimum 60 seconds between checks)
            if (now - lastCheckTime < 60 * 1000) {
                console.log('🔒 Skipping security check - too soon since last check');
                return;
            }

            lastCheckTime = now;

            console.log('🔍 Periodic security check - validating token consistency');
            if (!validateTokenUserConsistency()) {
                console.error('🚨 PERIODIC CHECK FAILED: Token-user mismatch detected!');
                refreshAuth().catch(error => {
                    console.error('Failed to refresh during periodic check:', error);
                });
            }
        };

        // Run security check every 5 minutes (less frequent)
        const securityInterval = setInterval(securityCheck, 5 * 60 * 1000);

        return () => {
            console.log('🔒 Clearing periodic security validation');
            clearInterval(securityInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized]); // Limited deps to prevent infinite refresh loops

    return (
        <>
            {children}
            {error && error.includes('Security Alert') && (
                <SecurityAlert
                    error={error}
                    onDismiss={() => {
                        clearError();
                        // Optionally redirect to login page
                        window.location.href = '/login';
                    }}
                />
            )}
        </>
    );
};

// Hook to use the auth provider
export const useAuthProvider = () => {
    return useAuthStore();
};
