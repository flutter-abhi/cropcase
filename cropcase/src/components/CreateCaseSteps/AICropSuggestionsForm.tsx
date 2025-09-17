"use client";

import { useState } from 'react';
import { Sparkles, Plus, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { Crop } from '@/types/crop';
import { useAICropSuggestions, AICropSuggestion } from '@/hooks/useAICropSuggestions';
import { useFormStore } from '@/stores/formStore';

interface AICropSuggestionsFormProps {
    availableCrops: Crop[];
}

export default function AICropSuggestionsForm({ availableCrops }: AICropSuggestionsFormProps) {
    const [query, setQuery] = useState('');
    const { suggestions, loading, error, getSuggestions, clearSuggestions } = useAICropSuggestions();
    const { formData, addAISuggestionToCrops } = useFormStore();

    const handleGetSuggestions = async () => {
        if (!query.trim()) return;

        const additionalContext = {
            landSize: formData.totalLand || undefined,
            location: formData.location || undefined,
            budget: formData.budget || undefined,
        };

        await getSuggestions(query, availableCrops, additionalContext);
    };

    const handleAddCrop = (suggestion: AICropSuggestion) => {
        // Find the full crop data to get season info
        const fullCropData = availableCrops.find(crop => crop.id === suggestion.cropId);

        if (fullCropData) {
            // Update the suggestion with correct season from database
            const enhancedSuggestion = {
                ...suggestion,
                season: fullCropData.season
            };

            addAISuggestionToCrops(enhancedSuggestion);
        }
    };

    const isAlreadyAdded = (cropId: string) => {
        return formData.crops.some(crop => crop.id === cropId);
    };

    return (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-foreground">
                    AI Crop Suggestions
                </h3>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Describe your farming requirements:
                    </label>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., I want profitable summer crops for 50 acres in California with a budget of $10,000"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleGetSuggestions}
                        disabled={loading || !query.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        {loading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
                    </button>

                    {suggestions.length > 0 && (
                        <button
                            onClick={clearSuggestions}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-red-600 font-medium">Error</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {/* Suggestions Results */}
            {suggestions.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <h4 className="font-medium text-foreground">
                            AI Suggestions ({suggestions.length})
                        </h4>
                    </div>

                    <div className="grid gap-3">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.cropId}-${index}`}
                                className="p-3 border border-border rounded-lg bg-background"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-medium text-foreground truncate">
                                                {suggestion.cropName}
                                            </h5>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {suggestion.suggestedWeight}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {suggestion.reasoning}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleAddCrop(suggestion)}
                                        disabled={isAlreadyAdded(suggestion.cropId)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        <Plus className="h-3 w-3" />
                                        {isAlreadyAdded(suggestion.cropId) ? 'Added' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Total suggested allocation:
                            </span>
                            <span className="font-medium text-foreground">
                                {suggestions.reduce((sum, s) => sum + s.suggestedWeight, 0)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Text */}
            {suggestions.length === 0 && !loading && !error && (
                <div className="text-center py-6">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        Describe your farming needs and get AI-powered crop recommendations
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        AI will suggest crops only from your database
                    </p>
                </div>
            )}
        </div>
    );
}
