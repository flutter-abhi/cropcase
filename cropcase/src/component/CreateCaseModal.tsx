"use client";

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import BasicInfoStep from './CreateCaseSteps/BasicInfoStep';
import CropSelectionStep from './CreateCaseSteps/CropSelectionStep';
import SettingsStep from './CreateCaseSteps/SettingsStep';
import ReviewStep from './CreateCaseSteps/ReviewStep';

interface CaseData {
    id: string;
    name: string;
    crops: Array<{
        name: string;
        weight: number;
        season: string;
    }>;
    user: {
        name: string;
        email: string;
    };
    createdAt: Date;
    totalLand: number;
    isOwner: boolean;
    likes?: number;
    views?: number;
    location?: string;
    description?: string;
    tags?: string[];
}

interface CreateCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (caseData: CaseData) => void;
}

interface FormData {
    name: string;
    description: string;
    totalLand: number;
    location: string;
    startDate: string;
    endDate: string;
    budget: number;
    isPublic: boolean;
    tags: string[];
    crops: Array<{
        name: string;
        weight: number;
        season: string;
    }>;
    notes: string;
}


export default function CreateCaseModal({ isOpen, onClose, onSubmit }: CreateCaseModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
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
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = () => {
        if (validateStep(currentStep)) {
            // Create dummy case data with the form data
            const dummyCaseData = {
                id: Date.now().toString(), // Simple ID generation
                name: formData.name,
                crops: formData.crops,
                user: {
                    name: "John Farmer",
                    email: "john@example.com"
                },
                createdAt: new Date(),
                totalLand: formData.totalLand,
                isOwner: true,
                // Add community features if public
                ...(formData.isPublic && {
                    likes: 0,
                    views: 0,
                    location: formData.location,
                    description: formData.description,
                    tags: formData.tags
                })
            };

            // Call the onSubmit callback with the dummy case data
            onSubmit(dummyCaseData);

            // Close modal and reset form
            onClose();
            setFormData({
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
                notes: ''
            });
            setCurrentStep(1);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Create New Case</h2>
                        <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
                    </div>
                    <button
                        onClick={onClose}
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
                    {currentStep === 1 && (
                        <BasicInfoStep
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                        />
                    )}

                    {currentStep === 2 && (
                        <CropSelectionStep
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                        />
                    )}

                    {currentStep === 3 && (
                        <SettingsStep
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                        />
                    )}

                    {currentStep === 4 && (
                        <ReviewStep
                            formData={formData}
                            errors={errors}
                        />
                    )}
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
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                            Cancel
                        </button>
                        {currentStep === 4 ? (
                            <button
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <Check className="h-4 w-4" />
                                Create Case
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
