import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '@/services/openaiService';
import { AI_PROMPTS, formatAdditionalContext, formatCropsDatabase } from '@/constants/aiPrompts';

interface CropSuggestion {
    cropId: string;
    cropName: string;
    suggestedWeight: number;
    reasoning: string;
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, availableCrops, additionalContext } = body;

        // Validate input
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!availableCrops || !Array.isArray(availableCrops) || availableCrops.length === 0) {
            return NextResponse.json({ error: 'Available crops are required' }, { status: 400 });
        }

        // Check OpenAI service configuration
        if (!openAIService.isConfigured()) {
            return NextResponse.json({
                error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.'
            }, { status: 500 });
        }

        // Generate prompts using constants
        const cropsDatabase = formatCropsDatabase(availableCrops);
        const contextInfo = formatAdditionalContext(additionalContext);

        const systemPrompt = AI_PROMPTS.CROP_SUGGESTIONS.system;
        const userPrompt = AI_PROMPTS.CROP_SUGGESTIONS.template(cropsDatabase, query, contextInfo);

        // Call OpenAI service
        const response = await openAIService.generateCropSuggestions(systemPrompt, userPrompt);

        if (!response.success) {
            return NextResponse.json({
                error: response.error || 'Failed to generate crop suggestions'
            }, { status: 500 });
        }

        const aiResponse = response.data as { suggestions: unknown[] };

        if (!aiResponse.suggestions || !Array.isArray(aiResponse.suggestions)) {
            return NextResponse.json({ error: 'AI response missing suggestions array' }, { status: 500 });
        }

        // Validate suggestions
        const validCropIds = new Set(availableCrops.map(c => c.id));
        const validCropNames = new Set(availableCrops.map(c => c.name));

        const validSuggestions = aiResponse.suggestions
            .filter((suggestion: unknown): suggestion is CropSuggestion => {
                const isValid = typeof suggestion === 'object' &&
                    suggestion !== null &&
                    'cropId' in suggestion &&
                    'cropName' in suggestion &&
                    'suggestedWeight' in suggestion &&
                    'reasoning' in suggestion &&
                    typeof (suggestion as CropSuggestion).cropId === 'string' &&
                    typeof (suggestion as CropSuggestion).cropName === 'string' &&
                    validCropIds.has((suggestion as CropSuggestion).cropId) &&
                    validCropNames.has((suggestion as CropSuggestion).cropName) &&
                    typeof (suggestion as CropSuggestion).suggestedWeight === 'number' &&
                    (suggestion as CropSuggestion).suggestedWeight > 0 &&
                    typeof (suggestion as CropSuggestion).reasoning === 'string';

                return isValid;
            })
            .map((suggestion: CropSuggestion) => ({
                cropId: suggestion.cropId,
                cropName: suggestion.cropName,
                suggestedWeight: Math.min(Math.max(suggestion.suggestedWeight, 1), 100),
                reasoning: suggestion.reasoning.substring(0, 200)
            }));

        if (validSuggestions.length === 0) {
            return NextResponse.json({
                error: 'AI did not return any valid crop suggestions from your database'
            }, { status: 500 });
        }

        // Normalize weights to total 100%
        const totalWeight = validSuggestions.reduce((sum: number, s: CropSuggestion) => sum + s.suggestedWeight, 0);
        const normalizedSuggestions = validSuggestions.map((s: CropSuggestion) => ({
            ...s,
            suggestedWeight: Math.round((s.suggestedWeight / totalWeight) * 100)
        }));

        return NextResponse.json({
            suggestions: normalizedSuggestions,
            metadata: {
                totalSuggestions: normalizedSuggestions.length,
                totalWeight: normalizedSuggestions.reduce((sum: number, s: CropSuggestion) => sum + s.suggestedWeight, 0)
            }
        });

    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
