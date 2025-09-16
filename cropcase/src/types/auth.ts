// Authentication related types

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
    isVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export interface AuthState {
    // State
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    clearError: () => void;

    // Profile management
    updateProfile: (data: Partial<User>) => Promise<void>;
    setUser: (user: User) => void;

    // Utility functions
    getAuthHeaders: () => Record<string, string>;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}
