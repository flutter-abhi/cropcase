import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '@/services/openaiService';
import { AI_PROMPTS, formatCropsDatabase } from '@/constants/aiPrompts';

interface RotationPlan {
    year: number;
    season: string;
    cropId: string;
    cropName: string;
    benefits: string;
}

export async function POST(request: NextRequest) {
    console.log('🔄 AI Crop Rotation API called');

    try {
        const body = await request.json();
        const { availableCrops, currentSeason, years = 3 } = body;

        console.log('📝 Request data:', {
            cropsCount: availableCrops?.length || 0,
            currentSeason,
            years
        });

        // Validate input
        if (!availableCrops || !Array.isArray(availableCrops) || availableCrops.length === 0) {
            console.log('❌ No available crops provided');
            return NextResponse.json({ error: 'Available crops are required' }, { status: 400 });
        }

        if (!currentSeason) {
            console.log('❌ Current season not provided');
            return NextResponse.json({ error: 'Current season is required' }, { status: 400 });
        }

        // Check OpenAI service configuration
        if (!openAIService.isConfigured()) {
            console.log('❌ OpenAI service not configured');
            return NextResponse.json({
                error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.'
            }, { status: 500 });
        }

        // Generate prompts using constants
        const cropsDatabase = formatCropsDatabase(availableCrops);
        const systemPrompt = AI_PROMPTS.CROP_ROTATION.system;
        const userPrompt = AI_PROMPTS.CROP_ROTATION.template(cropsDatabase, currentSeason, years);

        console.log('📤 Calling OpenAI Service for crop rotation...');

        // Call OpenAI service
        const response = await openAIService.generateCompletion<{ rotationPlan: RotationPlan[] }>(
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        );

        if (!response.success) {
            console.log('❌ OpenAI service error:', response.error);
            return NextResponse.json({
                error: response.error || 'Failed to generate crop rotation plan'
            }, { status: 500 });
        }

        const aiResponse = response.data;

        if (!aiResponse?.rotationPlan || !Array.isArray(aiResponse.rotationPlan)) {
            console.log('❌ AI response missing rotation plan array');
            return NextResponse.json({ error: 'AI response missing rotation plan' }, { status: 500 });
        }

        console.log('📊 Rotation plan entries:', aiResponse.rotationPlan.length);
        if (response.usage) {
            console.log('💰 Token usage:', response.usage);
        }

        return NextResponse.json({
            rotationPlan: aiResponse.rotationPlan,
            metadata: {
                totalEntries: aiResponse.rotationPlan.length,
                years: years,
                currentSeason: currentSeason
            }
        });

    } catch (error) {
        console.error('💥 Unexpected error in AI crop rotation:', error);

        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
