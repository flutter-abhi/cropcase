/**
 * Paginated Cases Hook
 * Production-ready custom hook for pagination logic
 */

import { useCallback, useEffect } from 'react';
import { usePaginatedCasesStore } from '@/stores/paginatedCasesStore';
import { useCommunityCasesStore } from '@/stores/communityCasesStore';
import { UsePaginationReturn, UseFiltersReturn } from '@/types/pagination';
import { UICaseData } from '@/types/ui';

/**
 * Main hook for paginated cases functionality
 */
export const usePaginatedCases = () => {
    const store = usePaginatedCasesStore();

    // Auto-fetch first page on mount
    useEffect(() => {
        if (!store.isPageCached(1) && !store.loading.loading && !store.loading.error) {
            store.fetchPage(1).catch(error => {
                console.error('Failed to fetch initial page:', error);
            });
        }
    }, [store]);

    // Memoized data getters
    const currentPageData = store.getCurrentPageData();
    const stats = store.getStats();

    return {
        // Current state
        currentPage: store.pagination.currentPage,
        pageSize: store.pagination.pageSize,
        totalPages: store.pagination.totalPages,
        totalCount: store.pagination.totalCount,
        hasNext: store.pagination.hasNext,
        hasPrev: store.pagination.hasPrev,
        loading: store.loading.loading,
        loadingPage: store.loading.loadingPage,
        error: store.loading.error,

        // Current data
        data: currentPageData,
        isEmpty: currentPageData.length === 0,
        stats,

        // Navigation
        goToPage: store.goToPage,
        nextPage: store.goToNextPage,
        prevPage: store.goToPrevPage,
        firstPage: store.goToFirstPage,
        lastPage: store.goToLastPage,

        // Data management
        refresh: store.refreshCurrentPage,
        refreshAll: store.refreshAll,
        clearCache: store.clearCache,

        // Utilities
        canGoNext: store.pagination.hasNext && !store.loading.loading,
        canGoPrev: store.pagination.hasPrev && !store.loading.loading,
        isPageCached: store.isPageCached,
        isPageStale: store.isPageStale,
    };
};

/**
 * Hook for pagination controls only
 */
export const usePagination = (): UsePaginationReturn => {
    const {
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        loading,
        error,
        data,
        isEmpty,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        refresh,
        canGoNext,
        canGoPrev,
    } = usePaginatedCases();

    return {
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        loading,
        error,
        data,
        isEmpty,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        refresh,
        canGoNext,
        canGoPrev,
    };
};

/**
 * Hook for filter controls only
 */
export const useFilters = (): UseFiltersReturn => {
    const {
        filters,
        setSearchTerm,
        setSortBy,
        setSortOrder,
        setSeason,
        setTags,
        setLandRange,
        clearFilters,
    } = usePaginatedCasesStore();

    // Computed values
    const hasActiveFilters =
        filters.searchTerm !== '' ||
        filters.season !== 'all' ||
        filters.tags.length > 0 ||
        filters.minLand !== undefined ||
        filters.maxLand !== undefined;

    const filterCount = [
        filters.searchTerm !== '',
        filters.season !== 'all',
        filters.tags.length > 0,
        filters.minLand !== undefined || filters.maxLand !== undefined,
    ].filter(Boolean).length;

    return {
        // Filter state
        searchTerm: filters.searchTerm,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        season: filters.season,
        tags: filters.tags,
        landRange: {
            min: filters.minLand,
            max: filters.maxLand,
        },

        // Filter actions
        setSearchTerm,
        setSortBy,
        setSortOrder,
        setSeason,
        setTags,
        setLandRange,
        clearFilters,

        // Computed
        hasActiveFilters,
        filterCount,
    };
};

/**
 * Hook for case management (add, update, delete)
 */
export const useCaseManagement = () => {
    const store = usePaginatedCasesStore();

    const addCase = useCallback((newCase: UICaseData) => {
        // Add to current page if there's space
        const currentPageData = store.getCurrentPageData();
        if (currentPageData.length < store.pagination.pageSize) {
            // Add to current page
            store.pages[store.pagination.currentPage] = [newCase, ...currentPageData];
        }

        // Invalidate cache to ensure fresh data
        store.clearCache();
        store.refreshCurrentPage();
    }, [store]);

    const updateCase = useCallback((caseId: string, updates: Partial<UICaseData>) => {
        // Update in current page if it exists
        const currentPageData = store.getCurrentPageData();
        const updatedData = currentPageData.map(case_ =>
            case_.id === caseId ? { ...case_, ...updates } : case_
        );

        if (JSON.stringify(updatedData) !== JSON.stringify(currentPageData)) {
            store.pages[store.pagination.currentPage] = updatedData;
        }
    }, [store]);

    const deleteCase = useCallback((caseId: string) => {
        // Remove from current page
        const currentPageData = store.getCurrentPageData();
        const filteredData = currentPageData.filter(case_ => case_.id !== caseId);

        store.pages[store.pagination.currentPage] = filteredData;

        // If page becomes empty and it's not the first page, go to previous page
        if (filteredData.length === 0 && store.pagination.currentPage > 1) {
            store.goToPrevPage();
        } else {
            // Refresh to get accurate counts
            store.refreshCurrentPage();
        }
    }, [store]);

    return {
        addCase,
        updateCase,
        deleteCase,
    };
};

/**
 * Hook for community cases (uses dedicated community store)
 */
export const useCommunityPaginatedCases = () => {
    const store = useCommunityCasesStore();

    // Auto-fetch first page on mount for community cases
    useEffect(() => {
        if (!store.isPageCached(1) && !store.loading && !store.error) {
            console.log('🏘️ Community Hook: Fetching initial page 1');
            store.fetchPage(1).catch(error => {
                console.error('Failed to fetch initial community page:', error);
            });
        }
    }, [store]);

    // Memoized data getters
    const currentPageData = store.getCurrentPageData();
    const stats = store.getStats();

    return {
        // Current state
        currentPage: store.currentPage,
        pageSize: store.pageSize,
        totalPages: store.totalPages,
        totalCount: store.totalCount,
        hasNext: store.hasNext,
        hasPrev: store.hasPrev,
        loading: store.loading,
        loadingPage: store.loadingPage,
        error: store.error,

        // Current data (no filtering needed - service already excludes current user)
        data: currentPageData,
        isEmpty: currentPageData.length === 0,
        stats,

        // Navigation (using dedicated community store)
        goToPage: store.goToPage,
        nextPage: store.nextPage,
        prevPage: store.prevPage,
        firstPage: store.firstPage,
        lastPage: store.lastPage,

        // Data management
        refresh: store.refresh,
        refreshAll: () => {
            store.clearCache();
            return store.firstPage();
        },
        clearCache: store.clearCache,

        // Utilities
        canGoNext: store.hasNext && !store.loading,
        canGoPrev: store.hasPrev && !store.loading,
        isPageCached: store.isPageCached,
        isPageStale: store.isPageStale,
    };
};

/**
 * Hook for search functionality
 */
export const useSearchCases = () => {
    // TODO: Implement search-specific functionality
    // This could use the search endpoint with different parameters

    return {
        // Placeholder - implement when needed
        searchResults: [],
        searching: false,
        search: async () => { },
        clearSearch: () => { },
    };
};

/**
 * Hook for performance monitoring
 */
export const usePaginationPerformance = () => {
    const store = usePaginatedCasesStore();

    const getPerformanceMetrics = useCallback(() => {
        const cacheStats = Object.keys(store.pages).length;
        const loadingStates = {
            loading: store.loading.loading,
            prefetching: store.loading.prefetching.size,
            loadingPage: store.loading.loadingPage,
        };

        return {
            cachedPages: cacheStats,
            loadingStates,
            totalCount: store.pagination.totalCount,
            currentPage: store.pagination.currentPage,
        };
    }, [store]);

    return {
        getPerformanceMetrics,
        clearCache: store.clearCache,
        optimizeCache: store.optimizeCache,
    };
};
