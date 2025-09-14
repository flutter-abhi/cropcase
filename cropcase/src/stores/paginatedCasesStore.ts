/**
 * Paginated Cases Store
 * Production-ready Zustand store with hybrid pagination approach
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { PaginatedCasesState } from '@/types/pagination';
import { paginatedCaseService } from '@/services/paginatedCaseService';
import { transformApiCasesToUI } from '@/lib/transformers';
import { PAGINATION_CONFIG, SORT_OPTIONS } from '@/constants/pagination';

// Initial state
const initialPaginationState = {
    currentPage: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
};

const initialLoadingState = {
    loading: false,
    loadingPage: null,
    prefetching: new Set<number>(),
    error: null,
};

const initialFilterState = {
    searchTerm: '',
    sortBy: SORT_OPTIONS.RECENT,
    sortOrder: 'desc' as const,
    season: 'all',
    tags: [],
    minLand: undefined,
    maxLand: undefined,
};

// Store creation with proper typing
export const usePaginatedCasesStore = create<PaginatedCasesState>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            // State
            pages: {},
            pageMetadata: {},
            pagination: initialPaginationState,
            loading: initialLoadingState,
            filters: initialFilterState,
            cacheTimestamps: {},
            prefetchQueue: [],

            // Data fetching actions
            fetchPage: async (page: number, force = false) => {
                const state = get();
                const { pageSize } = state.pagination;

                // Prevent duplicate requests
                if (state.loading.loadingPage === page && !force) {
                    return;
                }

                // Check if page is already cached and fresh
                if (!force && state.pages[page] && !state.isPageStale(page)) {
                    set((state) => ({
                        pagination: {
                            ...state.pagination,
                            currentPage: page,
                            hasNext: page < state.pagination.totalPages,
                            hasPrev: page > 1,
                        },
                        loading: {
                            ...state.loading,
                            error: null,
                        },
                    }));

                    // Trigger prefetching of adjacent pages
                    get().prefetchAdjacentPages(page);
                    return;
                }

                set((state) => ({
                    loading: {
                        ...state.loading,
                        loading: page === 1,
                        loadingPage: page,
                        error: null,
                    },
                }));

                try {
                    // TODO: Get current user ID from auth context
                    const currentUserId = "dummy-user-123";

                    const response = await paginatedCaseService.fetchMyCases({
                        page,
                        limit: pageSize,
                        userId: currentUserId,
                    });

                    const uiCases = transformApiCasesToUI(response.data, currentUserId);

                    set((state) => ({
                        pages: {
                            ...state.pages,
                            [page]: uiCases,
                        },
                        pageMetadata: {
                            ...state.pageMetadata,
                            [page]: response.pagination,
                        },
                        pagination: {
                            currentPage: page,
                            pageSize: response.pagination.limit,
                            totalPages: response.pagination.totalPages,
                            totalCount: response.pagination.total,
                            hasNext: response.pagination.hasNext,
                            hasPrev: response.pagination.hasPrev,
                        },
                        cacheTimestamps: {
                            ...state.cacheTimestamps,
                            [page]: Date.now(),
                        },
                        loading: {
                            ...state.loading,
                            loading: false,
                            loadingPage: null,
                            error: null,
                        },
                    }));

                    // Trigger prefetching of adjacent pages
                    get().prefetchAdjacentPages(page);

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cases';

                    console.error(`Failed to fetch page ${page}:`, error);

                    set((state) => ({
                        loading: {
                            ...state.loading,
                            loading: false,
                            loadingPage: null,
                            error: errorMessage,
                        },
                    }));

                    // Don't retry automatically - let user manually retry
                    throw error;
                }
            },

            fetchCommunityPage: async (page: number, force = false) => {
                console.log(`🏘️ Community: fetchCommunityPage(${page}, force: ${force})`);
                const state = get();
                const { pageSize } = state.pagination;

                // Prevent duplicate requests
                if (state.loading.loadingPage === page && !force) {
                    console.log(`🏘️ Community: Skipping - already loading page ${page}`);
                    return;
                }

                // Check if page is already cached and fresh
                if (!force && state.pages[page] && !state.isPageStale(page)) {
                    set((state) => ({
                        pagination: {
                            ...state.pagination,
                            currentPage: page,
                            hasNext: page < state.pagination.totalPages,
                            hasPrev: page > 1,
                        },
                        loading: {
                            ...state.loading,
                            error: null,
                        },
                    }));

                    // Trigger prefetching of adjacent pages
                    get().prefetchAdjacentPages(page);
                    return;
                }

                set((state) => ({
                    loading: {
                        ...state.loading,
                        loading: page === 1,
                        loadingPage: page,
                        error: null,
                    },
                }));

                try {
                    const currentUserId = "dummy-user-123";

                    // Fetch ALL cases (without userId filter) for community view
                    const response = await paginatedCaseService.fetchCommunityCases({
                        page,
                        limit: pageSize,
                        excludeUserId: currentUserId,
                    });

                    const uiCases = transformApiCasesToUI(response.data, currentUserId);

                    set((state) => ({
                        pages: {
                            ...state.pages,
                            [page]: uiCases,
                        },
                        pageMetadata: {
                            ...state.pageMetadata,
                            [page]: response.pagination,
                        },
                        pagination: {
                            currentPage: page,
                            pageSize: response.pagination.limit,
                            totalPages: response.pagination.totalPages,
                            totalCount: response.pagination.total,
                            hasNext: response.pagination.hasNext,
                            hasPrev: response.pagination.hasPrev,
                        },
                        cacheTimestamps: {
                            ...state.cacheTimestamps,
                            [page]: Date.now(),
                        },
                        loading: {
                            ...state.loading,
                            loading: false,
                            loadingPage: null,
                            error: null,
                        },
                    }));

                    // Trigger prefetching of adjacent pages
                    get().prefetchAdjacentPages(page);

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community cases';

                    console.error(`Failed to fetch community page ${page}:`, error);

                    set((state) => ({
                        loading: {
                            ...state.loading,
                            loading: false,
                            loadingPage: null,
                            error: errorMessage,
                        },
                    }));

                    throw error;
                }
            },

            prefetchPage: async (page: number) => {
                const state = get();

                // Skip if already cached or currently loading
                if (state.pages[page] || state.loading.prefetching.has(page) || state.loading.loadingPage === page) {
                    return;
                }

                set((state) => ({
                    loading: {
                        ...state.loading,
                        prefetching: new Set([...state.loading.prefetching, page]),
                    },
                }));

                try {
                    const currentUserId = "dummy-user-123";
                    const { pageSize } = state.pagination;

                    const response = await paginatedCaseService.fetchMyCases({
                        page,
                        limit: pageSize,
                        userId: currentUserId,
                    });

                    const uiCases = transformApiCasesToUI(response.data, currentUserId);

                    set((state) => ({
                        pages: {
                            ...state.pages,
                            [page]: uiCases,
                        },
                        pageMetadata: {
                            ...state.pageMetadata,
                            [page]: response.pagination,
                        },
                        cacheTimestamps: {
                            ...state.cacheTimestamps,
                            [page]: Date.now(),
                        },
                        loading: {
                            ...state.loading,
                            prefetching: new Set([...state.loading.prefetching].filter(p => p !== page)),
                        },
                    }));

                } catch (error) {
                    console.warn(`Prefetch failed for page ${page}:`, error);

                    set((state) => ({
                        loading: {
                            ...state.loading,
                            prefetching: new Set([...state.loading.prefetching].filter(p => p !== page)),
                        },
                    }));
                }
            },

            refreshCurrentPage: async () => {
                const { currentPage } = get().pagination;
                return get().fetchPage(currentPage, true);
            },

            refreshAll: async () => {
                set((state) => ({
                    pages: {},
                    pageMetadata: {},
                    cacheTimestamps: {},
                }));

                // Clear service cache
                paginatedCaseService.clearCache();

                const { currentPage } = get().pagination;
                return get().fetchPage(currentPage, true);
            },

            // Navigation actions
            goToPage: async (page: number) => {
                const { totalPages } = get().pagination;
                if (page < 1 || page > totalPages) return;

                return get().fetchPage(page);
            },

            goToNextPage: async () => {
                const { currentPage, hasNext } = get().pagination;
                if (hasNext) {
                    return get().goToPage(currentPage + 1);
                }
            },

            goToPrevPage: async () => {
                const { currentPage, hasPrev } = get().pagination;
                if (hasPrev) {
                    return get().goToPage(currentPage - 1);
                }
            },

            goToFirstPage: async () => {
                return get().goToPage(1);
            },

            goToLastPage: async () => {
                const { totalPages } = get().pagination;
                return get().goToPage(totalPages);
            },

            // Filter actions
            setSearchTerm: (term: string) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        searchTerm: term,
                    },
                }));

                // Reset to first page when searching
                if (term.length > 0) {
                    setTimeout(() => get().goToFirstPage(), PAGINATION_CONFIG.DEBOUNCE_SEARCH_MS);
                }
            },

            setSortBy: (sort) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        sortBy: sort,
                    },
                }));

                // Refresh current page with new sort
                get().refreshCurrentPage();
            },

            setSortOrder: (order) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        sortOrder: order,
                    },
                }));

                get().refreshCurrentPage();
            },

            setSeason: (season: string) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        season,
                    },
                }));

                get().goToFirstPage();
            },

            setTags: (tags: string[]) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        tags,
                    },
                }));

                get().goToFirstPage();
            },

            setLandRange: (min?: number, max?: number) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        minLand: min,
                        maxLand: max,
                    },
                }));

                get().goToFirstPage();
            },

            clearFilters: () => {
                set((state) => ({
                    filters: initialFilterState,
                }));

                get().goToFirstPage();
            },

            // Cache management
            clearCache: () => {
                set({
                    pages: {},
                    pageMetadata: {},
                    cacheTimestamps: {},
                });

                paginatedCaseService.clearCache();
            },

            clearPage: (page: number) => {
                set((state) => {
                    const { [page]: _, ...remainingPages } = state.pages;
                    const { [page]: _metadata, ...remainingMetadata } = state.pageMetadata;
                    const { [page]: _timestamp, ...remainingTimestamps } = state.cacheTimestamps;

                    return {
                        pages: remainingPages,
                        pageMetadata: remainingMetadata,
                        cacheTimestamps: remainingTimestamps,
                    };
                });
            },

            optimizeCache: () => {
                const state = get();
                const now = Date.now();
                const maxPages = PAGINATION_CONFIG.MAX_CACHED_PAGES;

                // Remove stale pages
                const stalePagesToRemove: number[] = [];
                Object.entries(state.cacheTimestamps).forEach(([page, timestamp]) => {
                    if (now - timestamp > PAGINATION_CONFIG.CACHE_TTL) {
                        stalePagesToRemove.push(parseInt(page));
                    }
                });

                // Remove excess pages (keep most recent)
                const allPages = Object.keys(state.pages).map(Number).sort((a, b) =>
                    (state.cacheTimestamps[b] || 0) - (state.cacheTimestamps[a] || 0)
                );

                const pagesToRemove = [...stalePagesToRemove, ...allPages.slice(maxPages)];

                if (pagesToRemove.length > 0) {
                    set((state) => {
                        const newPages = { ...state.pages };
                        const newMetadata = { ...state.pageMetadata };
                        const newTimestamps = { ...state.cacheTimestamps };

                        pagesToRemove.forEach(page => {
                            delete newPages[page];
                            delete newMetadata[page];
                            delete newTimestamps[page];
                        });

                        return {
                            pages: newPages,
                            pageMetadata: newMetadata,
                            cacheTimestamps: newTimestamps,
                        };
                    });
                }
            },

            // Utility methods
            prefetchAdjacentPages: (currentPage: number) => {
                const { totalPages } = get().pagination;

                // Prefetch next page
                if (currentPage < totalPages) {
                    setTimeout(() => get().prefetchPage(currentPage + 1), PAGINATION_CONFIG.PREFETCH_DELAY_MS);
                }

                // Prefetch previous page
                if (currentPage > 1) {
                    setTimeout(() => get().prefetchPage(currentPage - 1), PAGINATION_CONFIG.PREFETCH_DELAY_MS);
                }
            },

            // Getters
            getCurrentPageData: () => {
                const state = get();
                return state.pages[state.pagination.currentPage] || [];
            },

            getPageData: (page: number) => {
                return get().pages[page] || null;
            },

            isPageCached: (page: number) => {
                return !!get().pages[page];
            },

            isPageStale: (page: number) => {
                const timestamp = get().cacheTimestamps[page];
                if (!timestamp) return true;

                return Date.now() - timestamp > PAGINATION_CONFIG.CACHE_TTL;
            },

            getStats: () => {
                const state = get();
                const currentPageData = state.getCurrentPageData();

                return {
                    totalCases: state.pagination.totalCount,
                    totalLand: currentPageData.reduce((total, case_) => total + case_.totalLand, 0),
                };
            },
        })),
        {
            name: 'paginated-cases-store',
            partialize: (state: PaginatedCasesState) => ({
                filters: state.filters,
                pagination: {
                    pageSize: state.pagination.pageSize,
                },
            }),
        }
    )
);

// Optimize cache every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        usePaginatedCasesStore.getState().optimizeCache();
    }, 5 * 60 * 1000);
}
