/**
 * Pagination and Caching Constants
 * Production-ready configuration for pagination system
 */

export const PAGINATION_CONFIG = {
    // Page sizes
    DEFAULT_PAGE_SIZE: 12,
    MIN_PAGE_SIZE: 6,
    MAX_PAGE_SIZE: 50,

    // Caching
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_CACHED_PAGES: 5, // Maximum pages to keep in memory
    PREFETCH_ADJACENT_PAGES: 1, // Number of adjacent pages to prefetch

    // Loading states
    DEBOUNCE_SEARCH_MS: 300,
    PREFETCH_DELAY_MS: 1000, // Delay before prefetching

    // API endpoints
    ENDPOINTS: {
        CASES: '/api/cases',
        SEARCH_CASES: '/api/cases/search',
    } as const,
} as const;

export const CACHE_KEYS = {
    MY_CASES: (page: number, limit: number, userId?: string) =>
        `my-cases-${userId || 'current'}-${page}-${limit}`,
    COMMUNITY_CASES: (page: number, limit: number) =>
        `community-cases-${page}-${limit}`,
    SEARCH_CASES: (query: string, page: number, limit: number, filters: Record<string, unknown>) =>
        `search-cases-${query}-${page}-${limit}-${JSON.stringify(filters)}`,
} as const;

export const PAGINATION_ERRORS = {
    INVALID_PAGE: 'Invalid page number',
    INVALID_PAGE_SIZE: 'Invalid page size',
    FETCH_ERROR: 'Failed to fetch data',
    CACHE_ERROR: 'Cache operation failed',
} as const;

export const SORT_OPTIONS = {
    RECENT: 'recent',
    POPULAR: 'popular',
    VIEWS: 'views',
    ALPHABETICAL: 'alphabetical',
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
