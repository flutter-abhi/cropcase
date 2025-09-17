/**
 * Pagination Types and Interfaces
 * Production-ready type definitions for pagination system
 */

import { UICaseData } from './ui';
import { SortOption } from '@/constants/pagination';

// Core pagination interfaces
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

// Cache interfaces
export interface CachedPage<T> {
    data: T[];
    pagination: PaginationMeta;
    timestamp: number;
    isStale?: boolean;
}

export interface CacheEntry<T> {
    pages: Record<number, CachedPage<T>>;
    lastAccessed: number;
    totalCount: number;
}

// Store state interfaces
export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface LoadingState {
    loading: boolean;
    loadingPage: number | null;
    prefetching: Set<number>;
    error: string | null;
}

export interface FilterState {
    searchTerm: string;
    sortBy: SortOption;
    sortOrder: 'asc' | 'desc';
    season: string;
    tags: string[];
    minLand?: number;
    maxLand?: number;
}

// Main store interface
export interface PaginatedCasesState {
    // Data management
    pages: Record<number, UICaseData[]>;
    pageMetadata: Record<number, PaginationMeta>;

    // State
    pagination: PaginationState;
    loading: LoadingState;
    filters: FilterState;

    // Cache management
    cacheTimestamps: Record<number, number>;
    prefetchQueue: number[];

    // Actions - Data fetching
    fetchPage: (page: number, force?: boolean) => Promise<void>;
    fetchCommunityPage: (page: number, force?: boolean) => Promise<void>;
    prefetchPage: (page: number) => Promise<void>;
    refreshCurrentPage: () => Promise<void>;
    refreshAll: () => Promise<void>;

    // Actions - Navigation
    goToPage: (page: number) => Promise<void>;
    goToNextPage: () => Promise<void>;
    goToPrevPage: () => Promise<void>;
    goToFirstPage: () => Promise<void>;
    goToLastPage: () => Promise<void>;

    // Actions - Filters
    setSearchTerm: (term: string) => void;
    setSortBy: (sort: SortOption) => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    setSeason: (season: string) => void;
    setTags: (tags: string[]) => void;
    setLandRange: (min?: number, max?: number) => void;
    clearFilters: () => void;

    // Actions - Cache management
    clearCache: () => void;
    clearPage: (page: number) => void;
    optimizeCache: () => void;

    // Getters
    getCurrentPageData: () => UICaseData[];
    getPageData: (page: number) => UICaseData[] | null;
    isPageCached: (page: number) => boolean;
    isPageStale: (page: number) => boolean;
    getStats: () => { totalCases: number; totalLand: number };

    // Utility methods
    prefetchAdjacentPages: (currentPage: number) => void;
}

// API request/response types
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: SortOption;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
}

export interface SearchParams extends PaginationParams {
    q?: string;
    season?: string;
    tags?: string[];
    minLand?: number;
    maxLand?: number;
}

export interface MyCasesParams extends PaginationParams {
    userId: string;
}

export type CommunityCasesParams = SearchParams;

// Hook return types
export interface UsePaginationReturn {
    // Current state
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
    error: string | null;

    // Current data
    data: UICaseData[];
    isEmpty: boolean;

    // Navigation
    goToPage: (page: number) => Promise<void>;
    nextPage: () => Promise<void>;
    prevPage: () => Promise<void>;
    firstPage: () => Promise<void>;
    lastPage: () => Promise<void>;

    // Utilities
    refresh: () => Promise<void>;
    canGoNext: boolean;
    canGoPrev: boolean;
}

export interface UseFiltersReturn {
    // Filter state
    searchTerm: string;
    sortBy: SortOption;
    sortOrder: 'asc' | 'desc';
    season: string;
    tags: string[];
    landRange: { min?: number; max?: number };

    // Filter actions
    setSearchTerm: (term: string) => void;
    setSortBy: (sort: SortOption) => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    setSeason: (season: string) => void;
    setTags: (tags: string[]) => void;
    setLandRange: (min?: number, max?: number) => void;
    clearFilters: () => void;

    // Computed
    hasActiveFilters: boolean;
    filterCount: number;
}
