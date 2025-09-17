import { useState } from 'react';
import { Crop } from '@/types/crop';

export interface AICropSuggestion {
    cropId: string;
    cropName: string;
    suggestedWeight: number;
    reasoning: string;
}

interface UseAICropSuggestionsReturn {
    suggestions: AICropSuggestion[];
    loading: boolean;
    error: string | null;
    getSuggestions: (query: string, availableCrops: Crop[], additionalContext?: {
        landSize?: number;
        location?: string;
        budget?: number;
    }) => Promise<void>;
    clearSuggestions: () => void;
}

export const useAICropSuggestions = (): UseAICropSuggestionsReturn => {
    const [suggestions, setSuggestions] = useState<AICropSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const getSuggestions = async (
        query: string,
        availableCrops: Crop[],
        additionalContext?: {
            landSize?: number;
            location?: string;
            budget?: number;
        }
    ): Promise<void> => {
        if (!query.trim()) {
            setError('Please enter a query for crop suggestions');
            return;
        }

        if (availableCrops.length === 0) {
            setError('No crops available in database');
            return;
        }

        setLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const response = await fetch('/api/ai/crop-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    availableCrops,
                    additionalContext
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API error: ${response.status} ${response.statusText}`);
            }

            if (!data.suggestions || !Array.isArray(data.suggestions)) {
                throw new Error('Invalid response structure from AI service');
            }

            setSuggestions(data.suggestions);

        } catch (err) {
            console.error('Error getting AI crop suggestions:', err);
            setError(err instanceof Error ? err.message : 'Failed to get crop suggestions');
        } finally {
            setLoading(false);
        }
    };

    const clearSuggestions = () => {
        setSuggestions([]);
        setError(null);
    };

    return {
        suggestions,
        loading,
        error,
        getSuggestions,
        clearSuggestions,
    };
};
