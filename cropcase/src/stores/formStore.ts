import { create } from 'zustand';
import { FormData } from '@/types/form';
import { Crop } from '@/types/crop';

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
}));
