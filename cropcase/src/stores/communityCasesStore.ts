/**
 * Community Cases Store
 * Dedicated store for community cases to avoid cache conflicts
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UICaseData } from '@/types/ui';
import { paginatedCaseService } from '@/services/paginatedCaseService';
import { transformApiCasesToUI } from '@/lib/transformers';
import { PAGINATION_CONFIG, SORT_OPTIONS } from '@/constants/pagination';
import { useAuthStore } from '@/stores/authStore';
import { FilterState } from '@/types/pagination';

interface CommunityCasesState {
    // Data management
    pages: Record<number, UICaseData[]>;

    // Pagination state
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;

    // Loading states
    loading: boolean;
    loadingPage: number | null;
    error: string | null;

    // Filter state
    filters: FilterState;

    // Cache management
    cacheTimestamps: Record<number, number>;

    // Actions
    fetchPage: (page: number, force?: boolean) => Promise<void>;
    goToPage: (page: number) => Promise<void>;
    nextPage: () => Promise<void>;
    prevPage: () => Promise<void>;
    firstPage: () => Promise<void>;
    lastPage: () => Promise<void>;
    refresh: () => Promise<void>;
    clearCache: () => void;

    // Filter actions
    setSearchTerm: (term: string) => void;
    setSortBy: (sort: string) => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    setSeason: (season: string) => void;
    setTags: (tags: string[]) => void;
    setLandRange: (min?: number, max?: number) => void;
    clearFilters: () => void;

    // Getters
    getCurrentPageData: () => UICaseData[];
    isPageCached: (page: number) => boolean;
    isPageStale: (page: number) => boolean;
    getStats: () => { totalCases: number; totalLand: number };
}

const initialFilterState: FilterState = {
    searchTerm: '',
    sortBy: SORT_OPTIONS.RECENT,
    sortOrder: 'desc',
    season: 'all',
    tags: [],
    minLand: undefined,
    maxLand: undefined,
};

const initialState = {
    pages: {},
    currentPage: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
    loading: false,
    loadingPage: null,
    error: null,
    filters: initialFilterState,
    cacheTimestamps: {},
};

export const useCommunityCasesStore = create<CommunityCasesState>()(
    devtools((set, get) => ({
        ...initialState,

        fetchPage: async (page: number, force = false) => {
            console.log(`🏘️ Community Store: fetchPage(${page}, force: ${force})`);
            const state = get();

            // Prevent duplicate requests
            if (state.loadingPage === page && !force) {
                console.log(`🏘️ Community Store: Skipping - already loading page ${page}`);
                return;
            }

            // Check if page is already cached and fresh
            if (!force && state.pages[page] && !state.isPageStale(page)) {
                console.log(`🏘️ Community Store: Using cached page ${page}`);
                set({
                    currentPage: page,
                    hasNext: page < state.totalPages,
                    hasPrev: page > 1,
                    error: null,
                });
                return;
            }

            set({
                loading: page === 1,
                loadingPage: page,
                error: null,
            });

            try {
                // Get current user ID from auth store
                const authState = useAuthStore.getState();
                const currentUserId = authState.user?.id;

                if (!currentUserId) {
                    throw new Error('User not authenticated');
                }

                console.log(`🏘️ Community Store: Calling API for page ${page}`);
                const response = await paginatedCaseService.fetchCommunityCases({
                    page,
                    limit: state.pageSize,
                    q: state.filters.searchTerm,
                    season: state.filters.season,
                    tags: state.filters.tags,
                    minLand: state.filters.minLand,
                    maxLand: state.filters.maxLand,
                    sortBy: state.filters.sortBy,
                    sortOrder: state.filters.sortOrder,
                });

                const uiCases = transformApiCasesToUI(response.data, currentUserId);
                console.log(`🏘️ Community Store: Page ${page} loaded with ${uiCases.length} cases`);
                console.log(`🏘️ Community Store: Pagination info:`, response.pagination);

                set({
                    pages: {
                        ...state.pages,
                        [page]: uiCases,
                    },
                    currentPage: page,
                    pageSize: response.pagination.limit,
                    totalPages: response.pagination.totalPages,
                    totalCount: response.pagination.total,
                    hasNext: response.pagination.hasNext,
                    hasPrev: response.pagination.hasPrev,
                    cacheTimestamps: {
                        ...state.cacheTimestamps,
                        [page]: Date.now(),
                    },
                    loading: false,
                    loadingPage: null,
                    error: null,
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community cases';
                console.error(`🏘️ Community Store: Failed to fetch page ${page}:`, error);

                set({
                    loading: false,
                    loadingPage: null,
                    error: errorMessage,
                });

                throw error;
            }
        },

        goToPage: async (page: number) => {
            const { totalPages } = get();
            if (page < 1 || page > totalPages) return;
            return get().fetchPage(page);
        },

        nextPage: async () => {
            const { currentPage, hasNext } = get();
            if (hasNext) {
                return get().fetchPage(currentPage + 1);
            }
        },

        prevPage: async () => {
            const { currentPage, hasPrev } = get();
            if (hasPrev) {
                return get().fetchPage(currentPage - 1);
            }
        },

        firstPage: async () => {
            return get().fetchPage(1);
        },

        lastPage: async () => {
            const { totalPages } = get();
            return get().fetchPage(totalPages);
        },

        refresh: async () => {
            const { currentPage } = get();
            // Clear cache to ensure fresh data
            get().clearCache();
            paginatedCaseService.clearCache();
            return get().fetchPage(currentPage, true);
        },

        clearCache: () => {
            set({
                pages: {},
                cacheTimestamps: {},
            });
        },

        // Getters
        getCurrentPageData: () => {
            const { pages, currentPage } = get();
            return pages[currentPage] || [];
        },

        isPageCached: (page: number) => {
            return !!get().pages[page];
        },

        isPageStale: (page: number) => {
            const { cacheTimestamps } = get();
            const timestamp = cacheTimestamps[page];
            if (!timestamp) return true;

            return Date.now() - timestamp > PAGINATION_CONFIG.CACHE_TTL;
        },

        getStats: () => {
            const { totalCount, pages, currentPage } = get();
            const currentPageData = pages[currentPage] || [];

            return {
                totalCases: totalCount,
                totalLand: currentPageData.reduce((total, case_) => total + case_.totalLand, 0),
            };
        },

        // Filter actions
        setSearchTerm: (term: string) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    searchTerm: term,
                },
            }));
            // Clear cache and go to first page when searching
            get().clearCache();
            get().goToPage(1);
        },

        setSortBy: (sort: string) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    sortBy: sort as 'recent' | 'popular' | 'views' | 'alphabetical',
                },
            }));
            get().clearCache();
            get().refresh();
        },

        setSortOrder: (order: 'asc' | 'desc') => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    sortOrder: order,
                },
            }));
            get().clearCache();
            get().refresh();
        },

        setSeason: (season: string) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    season,
                },
            }));
            get().clearCache();
            get().goToPage(1);
        },

        setTags: (tags: string[]) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    tags,
                },
            }));
            get().clearCache();
            get().goToPage(1);
        },

        setLandRange: (min?: number, max?: number) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    minLand: min,
                    maxLand: max,
                },
            }));
            get().clearCache();
            get().goToPage(1);
        },

        clearFilters: () => {
            set(() => ({
                filters: initialFilterState,
            }));
            get().clearCache();
            get().goToPage(1);
        },
    }), {
        name: 'community-cases-store',
    })
);
