// API Constants and App Configuration
// Central place for all API endpoints and basic app constants

// App Configuration
export const APP_CONFIG = {
    name: "CropCase",
    version: "1.0.0",
    description: "Agricultural case management system",
    baseUrl: "http://localhost:3000",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Base API URL
    base: "/api",

    // Crop endpoints
    crops: {
        list: "/api/crop",
        create: "/api/crop",
        get: (id: string) => `/api/crop/${id}`,
        update: (id: string) => `/api/crop/${id}`,
        delete: (id: string) => `/api/crop/${id}`,
    },

    // Case endpoints
    cases: {
        list: "/api/cases",
        create: "/api/cases",
        get: (id: string) => `/api/cases/${id}`,
        update: (id: string) => `/api/cases/${id}`,
        delete: (id: string) => `/api/cases/${id}`,
        like: (id: string) => `/api/cases/${id}/like`,
        unlike: (id: string) => `/api/cases/${id}/unlike`,
    },

    // User endpoints
    users: {
        profile: "/api/users/profile",
        update: "/api/users/profile",
        cases: "/api/users/cases",
    },

    // Community endpoints
    community: {
        cases: "/api/community/cases",
        search: "/api/community/search",
        stats: "/api/community/stats",
    },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

// Response Status Codes
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// Common Headers
export const HEADERS = {
    CONTENT_TYPE: "Content-Type",
    AUTHORIZATION: "Authorization",
    ACCEPT: "Accept",
} as const;

// Content Types
export const CONTENT_TYPES = {
    JSON: "application/json",
    FORM_DATA: "multipart/form-data",
    URL_ENCODED: "application/x-www-form-urlencoded",
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: "Network error. Please check your connection.",
    SERVER_ERROR: "Server error. Please try again later.",
    NOT_FOUND: "Resource not found.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
    VALIDATION_ERROR: "Please check your input and try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    CREATED: "Created successfully!",
    UPDATED: "Updated successfully!",
    DELETED: "Deleted successfully!",
    SAVED: "Saved successfully!",
} as const;

// Form Constants
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;
