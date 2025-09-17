import { create } from 'zustand';
import { FormData } from '@/types/form';
import { Crop } from '@/types/crop';
import { UICaseData } from '@/types/ui';
import { AICropSuggestion } from '@/hooks/useAICropSuggestions';

// Extended interface for edit data that includes all possible fields
interface ExtendedCaseData extends Omit<UICaseData, 'crops'> {
    startDate?: string | Date;
    endDate?: string | Date;
    budget?: number;
    isPublic?: boolean;
    notes?: string;
    crops?: Array<{
        id?: string;
        name: string;
        weight: number;
        season: string;
    }>;
}

interface FormState {
    // Form data
    formData: FormData;

    // Form state
    currentStep: number;
    errors: Record<string, string>;
    isSubmitting: boolean;

    // Crops cache
    availableCrops: Crop[];
    cropsLoading: boolean;

    // AI suggestions state
    aiSuggestions: AICropSuggestion[];
    aiLoading: boolean;
    aiError: string | null;

    // Actions
    setFormData: (data: Partial<FormData>) => void;
    updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
    setCurrentStep: (step: number) => void;
    setErrors: (errors: Record<string, string>) => void;
    setError: (field: string, error: string) => void;
    clearError: (field: string) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    setAvailableCrops: (crops: Crop[]) => void;
    setCropsLoading: (loading: boolean) => void;
    resetForm: () => void;
    nextStep: () => void;
    prevStep: () => void;
    populateFormForEdit: (caseData: ExtendedCaseData) => void;

    // AI suggestions actions
    setAISuggestions: (suggestions: AICropSuggestion[]) => void;
    setAILoading: (loading: boolean) => void;
    setAIError: (error: string | null) => void;
    addAISuggestionToCrops: (suggestion: AICropSuggestion) => void;
    clearAISuggestions: () => void;
}

// Initial form data
const initialFormData: FormData = {
    name: '',
    description: '',
    totalLand: 0,
    location: '',
    startDate: '',
    endDate: '',
    budget: 0,
    isPublic: false,
    tags: [],
    crops: [],
    notes: '',
};

export const useFormStore = create<FormState>((set, get) => ({
    // Initial state
    formData: initialFormData,
    currentStep: 1,
    errors: {},
    isSubmitting: false,
    availableCrops: [],
    cropsLoading: false,

    // AI suggestions initial state
    aiSuggestions: [],
    aiLoading: false,
    aiError: null,

    // Actions
    setFormData: (data) =>
        set((state) => ({
            formData: { ...state.formData, ...data }
        })),

    updateField: (field, value) =>
        set((state) => ({
            formData: { ...state.formData, [field]: value }
        })),

    setCurrentStep: (step) => set({ currentStep: step }),

    setErrors: (errors) => set({ errors }),

    setError: (field, error) =>
        set((state) => ({
            errors: { ...state.errors, [field]: error }
        })),

    clearError: (field) =>
        set((state) => {
            const newErrors = { ...state.errors };
            delete newErrors[field];
            return { errors: newErrors };
        }),

    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

    setAvailableCrops: (crops) => set({ availableCrops: crops }),

    setCropsLoading: (loading) => set({ cropsLoading: loading }),

    resetForm: () => set({
        formData: initialFormData,
        currentStep: 1,
        errors: {},
        isSubmitting: false,
        availableCrops: [],
        cropsLoading: false,
        aiSuggestions: [],
        aiLoading: false,
        aiError: null,
    }),

    nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
            set({ currentStep: currentStep + 1 });
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
        }
    },

    populateFormForEdit: (caseData: ExtendedCaseData) => {
        const formData: FormData = {
            name: caseData.name || '',
            description: caseData.description || '',
            totalLand: caseData.totalLand || 0,
            location: caseData.location || '',
            startDate: caseData.startDate ? new Date(caseData.startDate).toISOString().split('T')[0] : '',
            endDate: caseData.endDate ? new Date(caseData.endDate).toISOString().split('T')[0] : '',
            budget: caseData.budget || 0,
            isPublic: caseData.isPublic || false,
            tags: caseData.tags || [],
            crops: (caseData.crops || []).map(crop => ({
                id: crop.id || '',
                name: crop.name,
                weight: crop.weight,
                season: crop.season
            })),
            notes: caseData.notes || '',
        };

        set({
            formData,
            currentStep: 1,
            errors: {},
            isSubmitting: false
        });
    },

    // AI suggestions actions
    setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),

    setAILoading: (loading) => set({ aiLoading: loading }),

    setAIError: (error) => set({ aiError: error }),

    addAISuggestionToCrops: (suggestion) => {
        const { formData, updateField } = get();

        // Check if crop already exists
        const existingCropIndex = formData.crops.findIndex(
            crop => crop.id === suggestion.cropId || crop.name === suggestion.cropName
        );

        if (existingCropIndex >= 0) {
            // Update existing crop weight
            const updatedCrops = [...formData.crops];
            updatedCrops[existingCropIndex] = {
                ...updatedCrops[existingCropIndex],
                weight: suggestion.suggestedWeight
            };
            updateField('crops', updatedCrops);
        } else {
            // Add new crop
            const newCrop = {
                id: suggestion.cropId,
                name: suggestion.cropName,
                weight: suggestion.suggestedWeight,
                season: "Summer" // Default season, will be updated from crop data
            };
            updateField('crops', [...formData.crops, newCrop]);
        }
    },

    clearAISuggestions: () => set({
        aiSuggestions: [],
        aiError: null
    }),
}));
