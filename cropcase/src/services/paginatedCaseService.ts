/**
 * Paginated Case Service
 * Production-ready service layer with intelligent caching and prefetching
 */

import {
    PaginatedResponse,
    MyCasesParams,
    CommunityCasesParams,
    SearchParams,
    CachedPage,
    PaginationMeta
} from '@/types/pagination';
import { ApiCaseResponse } from '@/services/caseService';
import { PAGINATION_CONFIG, CACHE_KEYS, PAGINATION_ERRORS } from '@/constants/pagination';
import { useAuthStore } from '@/stores/authStore';

// Cache management class
class CacheManager<T> {
    private cache = new Map<string, CachedPage<T>>();
    private readonly ttl: number;
    private readonly maxEntries: number;

    constructor(ttl: number = PAGINATION_CONFIG.CACHE_TTL, maxEntries: number = 100) {
        this.ttl = ttl;
        this.maxEntries = maxEntries;
    }

    get(key: string): CachedPage<T> | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if cache is stale
        const isStale = Date.now() - entry.timestamp > this.ttl;
        if (isStale) {
            this.cache.delete(key);
            return null;
        }

        return entry;
    }

    set(key: string, data: T[], pagination: PaginationMeta): void {
        // Cleanup old entries if cache is full
        if (this.cache.size >= this.maxEntries) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            data,
            pagination,
            timestamp: Date.now(),
        });
    }

    has(key: string): boolean {
        return this.cache.has(key) && this.get(key) !== null;
    }

    clear(): void {
        this.cache.clear();
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    // Get cache statistics
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Main service class
export class PaginatedCaseService {
    private static instance: PaginatedCaseService;
    private cacheManager = new CacheManager<ApiCaseResponse>();
    private pendingRequests = new Map<string, Promise<PaginatedResponse<ApiCaseResponse>>>();

    static getInstance(): PaginatedCaseService {
        if (!PaginatedCaseService.instance) {
            PaginatedCaseService.instance = new PaginatedCaseService();
        }
        return PaginatedCaseService.instance;
    }

    /**
     * Fetch user's cases with pagination
     */
    async fetchMyCases(params: MyCasesParams): Promise<PaginatedResponse<ApiCaseResponse>> {
        const { page = 1, limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, userId } = params;

        // Validate parameters
        this.validatePaginationParams(page, limit);

        const cacheKey = CACHE_KEYS.MY_CASES(page, limit, userId);

        // Check cache first
        const cached = this.cacheManager.get(cacheKey);
        if (cached) {
            return {
                data: cached.data,
                pagination: cached.pagination,
            };
        }

        // Check for pending request
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        // Use main cases endpoint with pagination parameters
        const requestPromise = this.makeRequest(
            '/api/cases',
            { page, limit, userId }
        );

        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const response = await requestPromise;

            // Cache the response
            this.cacheManager.set(cacheKey, response.data, response.pagination);

            return response;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Fetch community cases with pagination
     */
    async fetchCommunityCases(params: CommunityCasesParams): Promise<PaginatedResponse<ApiCaseResponse>> {
        const { page = 1, limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, excludeUserId } = params;

        this.validatePaginationParams(page, limit);

        const cacheKey = CACHE_KEYS.COMMUNITY_CASES(page, limit);

        // Check cache first
        const cached = this.cacheManager.get(cacheKey);
        if (cached) {
            return {
                data: cached.data,
                pagination: cached.pagination,
            };
        }

        // Check for pending request
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        // Use main cases endpoint with pagination parameters (no userId to get ALL cases)
        const requestPromise = this.makeRequest(
            '/api/cases',
            { page, limit }
        );

        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const response = await requestPromise;

            // Filter out user's own cases for community view
            if (excludeUserId && response.data) {
                response.data = response.data.filter((case_: ApiCaseResponse) => case_.userId !== excludeUserId);
            }

            // Cache the response
            this.cacheManager.set(cacheKey, response.data, response.pagination);

            return response;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Search cases with advanced filtering
     */
    async searchCases(params: SearchParams): Promise<PaginatedResponse<ApiCaseResponse>> {
        const {
            page = 1,
            limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
            q,
            season,
            tags,
            minLand,
            maxLand,
            sortBy,
            sortOrder
        } = params;

        this.validatePaginationParams(page, limit);

        const filters = { season, tags, minLand, maxLand, sortBy, sortOrder };
        const cacheKey = CACHE_KEYS.SEARCH_CASES(q || '', page, limit, filters);

        // For search, we use shorter cache TTL
        const cached = this.cacheManager.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < PAGINATION_CONFIG.CACHE_TTL / 2) {
            return {
                data: cached.data,
                pagination: cached.pagination,
            };
        }

        // Check for pending request
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        // Build search params
        const searchParams = new URLSearchParams();
        searchParams.append('page', page.toString());
        searchParams.append('limit', limit.toString());

        if (q) searchParams.append('q', q);
        if (season && season !== 'all') searchParams.append('season', season);
        if (tags) searchParams.append('tags', tags);
        if (minLand) searchParams.append('minLand', minLand.toString());
        if (maxLand) searchParams.append('maxLand', maxLand.toString());
        if (sortBy) searchParams.append('sortBy', sortBy);
        if (sortOrder) searchParams.append('sortOrder', sortOrder);

        const requestPromise = this.makeRequest(
            `${PAGINATION_CONFIG.ENDPOINTS.SEARCH_CASES}?${searchParams.toString()}`,
            {},
            'GET'
        );

        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const response = await requestPromise;

            // Cache the response with shorter TTL for search
            this.cacheManager.set(cacheKey, response.data, response.pagination);

            return response;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Prefetch adjacent pages for better UX
     */
    async prefetchAdjacentPages(
        currentPage: number,
        fetchFunction: (page: number) => Promise<PaginatedResponse<ApiCaseResponse>>,
        totalPages: number
    ): Promise<void> {
        const pagesToPrefetch: number[] = [];

        // Prefetch next page
        if (currentPage < totalPages) {
            pagesToPrefetch.push(currentPage + 1);
        }

        // Prefetch previous page
        if (currentPage > 1) {
            pagesToPrefetch.push(currentPage - 1);
        }

        // Prefetch pages in background
        setTimeout(() => {
            pagesToPrefetch.forEach(page => {
                fetchFunction(page).catch(error => {
                    console.warn(`Prefetch failed for page ${page}:`, error);
                });
            });
        }, PAGINATION_CONFIG.PREFETCH_DELAY_MS);
    }

    /**
     * Clear cache for specific pattern
     */
    clearCache(pattern?: string): void {
        if (pattern) {
            // Clear specific pattern
            const stats = this.cacheManager.getStats();
            stats.keys.forEach(key => {
                if (key.includes(pattern)) {
                    this.cacheManager.delete(key);
                }
            });
        } else {
            // Clear all cache
            this.cacheManager.clear();
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cacheManager.getStats();
    }

    /**
     * Make HTTP request with error handling
     */
    private async makeRequest(
        url: string,
        params: Record<string, unknown>,
        method: 'GET' | 'POST' = 'GET'
    ): Promise<PaginatedResponse<ApiCaseResponse>> {
        try {
            let requestUrl = url;
            const requestInit: RequestInit = { method };

            // Add authentication headers
            const authState = useAuthStore.getState();
            const headers: Record<string, string> = {};

            if (authState.accessToken) {
                headers['Authorization'] = `Bearer ${authState.accessToken}`;
            }

            if (method === 'GET' && Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        searchParams.append(key, value.toString());
                    }
                });
                requestUrl += `?${searchParams.toString()}`;
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                requestInit.body = JSON.stringify(params);
            }

            requestInit.headers = headers;
            const response = await fetch(requestUrl, requestInit);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different response formats
            // If it's already paginated format, return as is
            if (data.data && data.pagination) {
                return data;
            }

            // If it's legacy format (array of cases), convert to paginated format
            if (Array.isArray(data)) {
                return {
                    data: data,
                    pagination: {
                        page: 1,
                        limit: data.length,
                        total: data.length,
                        totalPages: 1,
                        hasNext: false,
                        hasPrev: false,
                    }
                };
            }

            // If neither format, throw error
            throw new Error('Invalid response structure');
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error(PAGINATION_ERRORS.FETCH_ERROR);
        }
    }

    /**
     * Validate pagination parameters
     */
    private validatePaginationParams(page: number, limit: number): void {
        if (!Number.isInteger(page) || page < 1) {
            throw new Error(PAGINATION_ERRORS.INVALID_PAGE);
        }

        if (!Number.isInteger(limit) || limit < PAGINATION_CONFIG.MIN_PAGE_SIZE || limit > PAGINATION_CONFIG.MAX_PAGE_SIZE) {
            throw new Error(PAGINATION_ERRORS.INVALID_PAGE_SIZE);
        }
    }
}

// Export singleton instance
export const paginatedCaseService = PaginatedCaseService.getInstance();
