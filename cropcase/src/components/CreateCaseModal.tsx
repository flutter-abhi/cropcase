"use client";

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import BasicInfoStep from './CreateCaseSteps/BasicInfoStep';
import CropSelectionStep from './CreateCaseSteps/CropSelectionStep';
import SettingsStep from './CreateCaseSteps/SettingsStep';
import ReviewStep from './CreateCaseSteps/ReviewStep';
import { useFormStore } from '@/stores/formStore';
import { UICaseData } from '@/types/ui';
import { transformApiCaseToUI } from '@/lib/transformers';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { ApiCaseResponse } from '@/services/caseService';

interface CreateCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (caseData: UICaseData) => void;
    editData?: UICaseData; // Optional data for editing
    mode?: 'create' | 'edit'; // Modal mode
}



export default function CreateCaseModal({ isOpen, onClose, onSubmit, editData, mode = 'create' }: CreateCaseModalProps) {
    const { post, put } = useApi();
    const { user } = useAuth();
    const {
        formData,
        currentStep,
        isSubmitting,
        setErrors,
        setIsSubmitting,
        resetForm,
        nextStep,
        prevStep,
        populateFormForEdit,
    } = useFormStore();

    // Populate form with edit data when modal opens
    useEffect(() => {
        if (isOpen && editData && mode === 'edit') {
            populateFormForEdit(editData);
        } else if (isOpen && mode === 'create') {
            resetForm();
        }
    }, [isOpen, editData, mode, populateFormForEdit, resetForm]);

    const steps = [
        { id: 1, title: "Basic Info", icon: "📝" },
        { id: 2, title: "Crops", icon: "🌱" },
        { id: 3, title: "Settings", icon: "⚙️" },
        { id: 4, title: "Review", icon: "👁️" }
    ];

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.name.trim()) newErrors.name = "Case name is required";
                if (formData.totalLand <= 0) newErrors.totalLand = "Total land must be greater than 0";
                if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
                    newErrors.endDate = "End date must be after start date";
                }
                break;
            case 2:
                if (formData.crops.length === 0) newErrors.crops = "At least one crop is required";
                const totalWeight = formData.crops.reduce((sum, crop) => sum + crop.weight, 0);
                if (totalWeight !== 100) newErrors.crops = "Crop allocation must equal 100%";
                break;
            case 3:
                // No validation needed for settings step - all fields are optional
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            nextStep();
        }
    };

    const handlePrevious = () => {
        prevStep();
    };

    const handleSubmit = async () => {
        if (validateStep(currentStep)) {
            setIsSubmitting(true);

            try {
                // Use crop IDs from form data (no API call needed!)
                const mappedCrops = formData.crops.map(formCrop => {
                    if (!formCrop.id) {
                        throw new Error(`Crop "${formCrop.name}" is missing ID - please reselect the crop`);
                    }

                    return {
                        cropId: formCrop.id,
                        weight: formCrop.weight,
                        notes: `${formCrop.season} season`
                    };
                });

                // Prepare API data
                const apiData = {
                    name: formData.name,
                    description: formData.description,
                    totalLand: formData.totalLand,
                    location: formData.location,
                    isPublic: formData.isPublic,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    budget: formData.budget,
                    notes: formData.notes,
                    status: 'active',
                    tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
                    crops: mappedCrops
                };

                let result;
                if (mode === 'edit' && editData) {
                    // Update existing case
                    result = await put(`/api/cases/${editData.id}`, apiData);
                } else {
                    // Create new case
                    result = await post('/api/cases', apiData);
                }

                // Transform API response directly to UI format
                const currentUserId = user?.id || '';
                const caseData = transformApiCaseToUI(result as ApiCaseResponse, currentUserId);

                // Call the onSubmit callback with the case data
                onSubmit(caseData);

                // Close modal and reset form
                resetForm();
                onClose();

            } catch (error) {
                console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} case:`, error);
                alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} case. Please try again.`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {mode === 'edit' ? 'Edit Case' : 'Create New Case'}
                        </h2>
                        <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${currentStep >= step.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {currentStep > step.id ? <Check className="h-4 w-4" /> : step.icon}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {currentStep === 1 && <BasicInfoStep />}

                    {currentStep === 2 && <CropSelectionStep />}

                    {currentStep === 3 && <SettingsStep />}

                    {currentStep === 4 && <ReviewStep />}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-border">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                            Cancel
                        </button>
                        {currentStep === 4 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {mode === 'edit' ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        {mode === 'edit' ? 'Update Case' : 'Create Case'}
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
