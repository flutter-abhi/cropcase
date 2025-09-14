import { useCallback } from 'react';
import { useCasesStore } from '@/stores/casesStore';
import { getCases } from '@/services/caseService';
import { transformApiCasesToUI } from '@/lib/transformers';

export const useCases = () => {
    const {
        cases,
        loading,
        error,
        searchTerm,
        filterSeason,
        setCases,
        addCase,
        updateCase,
        deleteCase,
        setLoading,
        setError,
        setSearchTerm,
        setFilterSeason,
        getFilteredCases,
        getTotalStats,
        reset,
    } = useCasesStore();

    // Fetch cases from API
    const fetchCases = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const apiCases = await getCases();

            // TODO: Get current user ID from auth context
            const currentUserId = "dummy-user-123"; // Replace with actual auth

            const uiCases = transformApiCasesToUI(apiCases, currentUserId);
            setCases(uiCases);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cases';
            setError(errorMessage);
            console.error('Error fetching cases:', err);
        } finally {
            setLoading(false);
        }
    }, [setCases, setLoading, setError]);

    // Refresh cases (force refetch)
    const refreshCases = useCallback(() => {
        return fetchCases();
    }, [fetchCases]);

    return {
        // State
        cases,
        loading,
        error,
        searchTerm,
        filterSeason,

        // Computed
        filteredCases: getFilteredCases(),
        totalStats: getTotalStats(),

        // Actions
        fetchCases,
        refreshCases,
        addCase,
        updateCase,
        deleteCase,

        // Filters
        setSearchTerm,
        setFilterSeason,

        // Utility
        reset,
    };
};
