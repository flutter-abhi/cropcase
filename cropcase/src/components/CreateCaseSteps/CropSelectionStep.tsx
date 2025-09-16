"use client";

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/constants';
import { Crop } from '@/types/crop';
import CropSelectionForm from './CropSelectionForm';
import { useFormStore } from '@/stores/formStore';

export default function CropSelectionStep() {
    const { availableCrops, setAvailableCrops, setCropsLoading } = useFormStore();
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch crops from API
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                setCropsLoading(true);
                const response = await fetch(API_ENDPOINTS.crops.list);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const cropsData = await response.json();

                // Cache crops in Zustand store
                setAvailableCrops(cropsData);
                setCrops(cropsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching crops:', err);
                setError('Failed to load crops');
            } finally {
                setCropsLoading(false);
                setLoading(false);
            }
        };

        // Use cached crops if available, otherwise fetch
        if (availableCrops.length > 0) {
            setCrops(availableCrops);
            setLoading(false);
        } else {
            fetchCrops();
        }
    }, [availableCrops, setAvailableCrops, setCropsLoading]); // Added dependencies

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading crops...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <CropSelectionForm
            availableCrops={crops}
        />
    );
}
