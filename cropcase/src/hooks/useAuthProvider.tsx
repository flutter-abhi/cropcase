'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Provider component to handle authentication initialization
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { refreshAuth, isAuthenticated, refreshToken, accessToken, isLoading } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        console.log('AuthProvider: refreshAuth =====');
        refreshAuth();
    }, []);
    useEffect(() => {
        const initializeAuth = async () => {
            const isFirstVisit = !sessionStorage.getItem('auth-initialized');
            const isPageRefresh = performance.navigation?.type === 1; // 1 = reload

            if (refreshToken && !accessToken && !isAuthenticated && !isLoading && (isFirstVisit || isPageRefresh)) {
                try {
                    console.log('🔄 Initializing auth - first visit or page refresh');
                    await refreshAuth();
                } catch (error) {
                    console.error('AuthProvider: Failed to refresh token on init:', error);
                    // Don't throw error, just continue
                }
            }

            // Mark as initialized in session storage
            sessionStorage.setItem('auth-initialized', 'true');
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

                // Refresh token 5 minutes before expiry
                const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

                if (refreshTime > 0) {
                    const timeoutId = setTimeout(() => {
                        refreshAuth().catch(console.error);
                    }, refreshTime);

                    return () => clearTimeout(timeoutId);
                }
            } catch (error) {
                console.error('Error parsing JWT token:', error);
            }
        }
    }, [accessToken, refreshAuth, isInitialized]);

    return <>{children}</>;
};

// Hook to use the auth provider
export const useAuthProvider = () => {
    return useAuthStore();
};
