import { useCallback } from 'react';
import { useCasesStore } from '@/stores/casesStore';
import { transformApiCasesToUI } from '@/lib/transformers';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { ApiCaseResponse } from '@/services/caseService';

export const useCases = () => {
    const { get, post, put, del: deleteApi } = useApi();
    const { user } = useAuth();
    const {
        cases,
        loading,
        error,
        searchTerm,
        filterSeason,
        setCases,
        addCase,
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

            const apiCases = await get('/api/cases');
            const currentUserId = user?.id || '';

            const uiCases = transformApiCasesToUI(apiCases, currentUserId);
            setCases(uiCases);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cases';
            setError(errorMessage);
            console.error('Error fetching cases:', err);
        } finally {
            setLoading(false);
        }
    }, [get, user?.id, setCases, setLoading, setError]);

    // Refresh cases (force refetch)
    const refreshCases = useCallback(() => {
        return fetchCases();
    }, [fetchCases]);

    // Create case
    const createCase = useCallback(async (caseData: Partial<ApiCaseResponse>) => {
        try {
            setLoading(true);
            setError(null);

            const newCase = await post('/api/cases', caseData);
            const currentUserId = user?.id || '';
            const uiCase = transformApiCasesToUI([newCase], currentUserId)[0];

            addCase(uiCase);
            return uiCase;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create case';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [post, user?.id, addCase, setLoading, setError]);

    // Update case
    const updateCaseById = useCallback(async (id: string, caseData: Partial<ApiCaseResponse>) => {
        try {
            setLoading(true);
            setError(null);

            const updatedCase = await put(`/api/cases/${id}`, caseData);
            const currentUserId = user?.id || '';
            const uiCase = transformApiCasesToUI([updatedCase], currentUserId)[0];

            // Note: updateCase from store expects a UICaseData, we'll handle this properly
            // For now, we'll refetch to get the updated data
            await fetchCases();
            return uiCase;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update case';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [put, user?.id, fetchCases, setLoading, setError]);

    // Delete case
    const deleteCaseById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await deleteApi(`/api/cases/${id}`);
            deleteCase(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete case';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [deleteApi, deleteCase, setLoading, setError]);

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
        createCase,
        updateCaseById,
        deleteCaseById,

        // Filters
        setSearchTerm,
        setFilterSeason,

        // Utility
        reset,
    };
};
