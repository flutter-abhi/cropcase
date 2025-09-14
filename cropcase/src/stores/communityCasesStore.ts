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

    // Getters
    getCurrentPageData: () => UICaseData[];
    isPageCached: (page: number) => boolean;
    isPageStale: (page: number) => boolean;
    getStats: () => { totalCases: number; totalLand: number };
}

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
                const currentUserId = "dummy-user-123";

                console.log(`🏘️ Community Store: Calling API for page ${page}`);
                const response = await paginatedCaseService.fetchCommunityCases({
                    page,
                    limit: state.pageSize,
                    excludeUserId: currentUserId,
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
    }), {
        name: 'community-cases-store',
    })
);
