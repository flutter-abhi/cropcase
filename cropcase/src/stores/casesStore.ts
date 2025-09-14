import { create } from 'zustand';
import { UICaseData } from '@/types/ui';

interface CasesState {
    // State
    cases: UICaseData[];
    loading: boolean;
    error: string | null;

    // Filter/Search state
    searchTerm: string;
    filterSeason: string;

    // Actions
    setCases: (cases: UICaseData[]) => void;
    addCase: (newCase: UICaseData) => void;
    updateCase: (id: string, updates: Partial<UICaseData>) => void;
    deleteCase: (id: string) => void;

    // Loading/Error actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Filter actions
    setSearchTerm: (term: string) => void;
    setFilterSeason: (season: string) => void;

    // Computed getters
    getFilteredCases: () => UICaseData[];
    getTotalStats: () => { totalCases: number; totalLandManaged: number };

    // Reset
    reset: () => void;
}

const initialState = {
    cases: [],
    loading: false,
    error: null,
    searchTerm: '',
    filterSeason: 'all',
};

export const useCasesStore = create<CasesState>((set, get) => ({
    // Initial state
    ...initialState,

    // Actions
    setCases: (cases) => set({ cases, error: null }),

    addCase: (newCase) =>
        set((state) => ({
            cases: [newCase, ...state.cases], // Add to beginning
        })),

    updateCase: (id, updates) =>
        set((state) => ({
            cases: state.cases.map(case_ =>
                case_.id === id ? { ...case_, ...updates } : case_
            ),
        })),

    deleteCase: (id) =>
        set((state) => ({
            cases: state.cases.filter(case_ => case_.id !== id),
        })),

    // Loading/Error
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Filters
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setFilterSeason: (filterSeason) => set({ filterSeason }),

    // Computed getters
    getFilteredCases: () => {
        const { cases, searchTerm, filterSeason } = get();

        return cases.filter(caseItem => {
            const matchesSearch = searchTerm === '' ||
                caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                caseItem.crops.some(crop =>
                    crop.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesSeason = filterSeason === 'all' ||
                caseItem.crops.some(crop =>
                    crop.season.toLowerCase() === filterSeason.toLowerCase()
                );

            return matchesSearch && matchesSeason;
        });
    },

    getTotalStats: () => {
        const { cases } = get();
        return {
            totalCases: cases.length,
            totalLandManaged: cases.reduce((total, case_) => total + case_.totalLand, 0)
        };
    },

    // Reset
    reset: () => set(initialState),
}));
