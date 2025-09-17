// AI Prompt Templates
// Centralized prompts for different AI use cases

export const AI_PROMPTS = {
    // Crop suggestions prompt template
    CROP_SUGGESTIONS: {
        system: "You are an agricultural expert AI assistant. Always respond with valid JSON only.",

        template: (cropsDatabase: string, query: string, contextInfo: string) => `
You are an expert agricultural consultant with deep knowledge of global farming practices, market trends, and regional agricultural conditions.

STRICT RULE: You can ONLY suggest crops from this exact database list below. Do not suggest any crops not in this list.

AVAILABLE CROPS DATABASE:
${cropsDatabase}

USER QUERY: "${query}"
${contextInfo}

ANALYSIS FRAMEWORK:
Before making recommendations, analyze these factors based on your agricultural expertise:

1. SEASONAL ANALYSIS:
   - Current season and optimal planting times
   - Regional climate patterns and monsoon cycles
   - Temperature and rainfall requirements for each crop

2. LOCATION-SPECIFIC FACTORS:
   - If location is mentioned (India, Maharashtra, California, etc.), consider:
     * Regional soil types and conditions
     * Local climate patterns and weather cycles  
     * Traditional crops grown in that region
     * Government policies and subsidies
     * Market access and transportation

3. PROFITABILITY ANALYSIS:
   - Current market demand and pricing trends
   - Export potential and value-added processing
   - Input costs vs output returns
   - Risk factors and market volatility

4. AGRICULTURAL BEST PRACTICES:
   - Crop rotation benefits and soil health
   - Water requirements and irrigation needs
   - Pest and disease resistance
   - Mechanization compatibility

5. SUSTAINABILITY FACTORS:
   - Environmental impact and carbon footprint
   - Organic farming potential
   - Long-term soil health effects

REQUIREMENTS:
1. Suggest MAXIMUM 10 crops from the above database list ONLY
2. Use exact crop IDs and names from the database
3. Provide allocation percentages that total 100%
4. Prioritize crops based on profitability, regional suitability, and current market trends
5. Consider seasonal timing and regional agricultural patterns
6. Give detailed reasoning incorporating market trends and regional factors (2-3 sentences)

RESPONSE FORMAT (Valid JSON only):
{
  "suggestions": [
    {
      "cropId": "exact-id-from-database",
      "cropName": "exact-name-from-database",
      "suggestedWeight": 25,
      "reasoning": "Detailed explanation covering profitability, seasonal suitability, and regional factors. Include market trends and why this crop is optimal for the specified conditions."
    }
  ]
}

Important: 
- Base recommendations on real agricultural knowledge and market understanding
- Consider regional specialties and profitable crops for the mentioned location
- Factor in current season, climate, and market demand
- Return only valid JSON. Do not include any text before or after the JSON response.`,

        responseSchema: {
            type: "object",
            properties: {
                suggestions: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            cropId: { type: "string" },
                            cropName: { type: "string" },
                            suggestedWeight: { type: "number" },
                            reasoning: { type: "string" }
                        },
                        required: ["cropId", "cropName", "suggestedWeight", "reasoning"]
                    }
                }
            },
            required: ["suggestions"]
        }
    },

} as const;

// Helper function to format context information
export const formatAdditionalContext = (context?: {
    landSize?: number;
    location?: string;
    budget?: number;
    soilType?: string;
    climate?: string;
}) => {
    if (!context) return '';

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentSeason = getCurrentSeason();

    return `
FARMING CONTEXT:
- Land Size: ${context.landSize || 'Not specified'} acres
- Location: ${context.location || 'Not specified'}
- Budget: $${context.budget || 'Not specified'}
- Soil Type: ${context.soilType || 'Not specified'}  
- Climate: ${context.climate || 'Not specified'}
- Current Month: ${currentMonth}
- Current Season: ${currentSeason}

LOCATION-SPECIFIC GUIDANCE:
${getLocationSpecificGuidance(context.location)}

SEASONAL CONSIDERATIONS:
${getSeasonalGuidance(currentSeason, context.location)}
`;
};

// Helper function to determine current season
const getCurrentSeason = (): string => {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Fall/Autumn';
    return 'Winter';
};

// Helper function to provide location-specific agricultural guidance
const getLocationSpecificGuidance = (location?: string): string => {
    if (!location) return 'Consider local climate, soil conditions, and market access when selecting crops.';

    const loc = location.toLowerCase();

    if (loc.includes('india') || loc.includes('maharashtra') || loc.includes('punjab') || loc.includes('haryana')) {
        return `
For Indian agriculture:
- Consider monsoon patterns and kharif/rabi seasons
- Focus on crops with good market demand in Indian markets
- Consider government MSP (Minimum Support Price) crops
- Factor in traditional crops that perform well in Indian conditions
- Consider export potential for international markets
- Account for local processing and value-addition opportunities`;
    }

    if (loc.includes('california') || loc.includes('usa') || loc.includes('america')) {
        return `
For US/California agriculture:
- Consider drought-resistant crops due to water scarcity
- Focus on high-value crops for premium markets
- Consider mechanization-friendly crops
- Factor in organic farming opportunities
- Account for export markets and processing facilities`;
    }

    if (loc.includes('australia')) {
        return `
For Australian agriculture:
- Consider drought tolerance and water efficiency
- Focus on crops suitable for large-scale mechanized farming
- Consider export markets, especially to Asia
- Factor in seasonal variations and climate patterns`;
    }

    return `
For ${location}:
- Research local climate patterns and optimal planting seasons
- Consider regional market demand and pricing
- Factor in local soil conditions and water availability
- Account for transportation and processing facilities
- Consider traditional crops that perform well in this region`;
};

// Helper function to provide seasonal guidance
const getSeasonalGuidance = (season: string, location?: string): string => {
    const baseGuidance = {
        'Spring': 'Ideal time for planting warm-season crops. Focus on crops that can be harvested before peak summer heat.',
        'Summer': 'Consider heat-tolerant crops and those with good water efficiency. Plan for monsoon crops if in monsoon regions.',
        'Fall/Autumn': 'Good time for cool-season crops and winter preparations. Consider crops that can handle temperature drops.',
        'Winter': 'Focus on cool-season crops and plan for spring planting. Consider protected cultivation for sensitive crops.'
    };

    let guidance = baseGuidance[season as keyof typeof baseGuidance] || 'Consider seasonal timing for optimal crop performance.';

    if (location?.toLowerCase().includes('india')) {
        if (season === 'Summer') {
            guidance += ' In India, this is ideal for kharif crops that benefit from monsoon rains.';
        } else if (season === 'Winter') {
            guidance += ' Perfect timing for rabi crops in India that grow during cooler months.';
        }
    }

    return guidance;
};

// Helper function to format crops database
export const formatCropsDatabase = (crops: Array<{
    id: string;
    name: string;
    season: string;
    duration?: number;
    description?: string;
}>) => {
    return crops.map(crop =>
        `- ID: ${crop.id}, Name: ${crop.name}, Season: ${crop.season}, Duration: ${crop.duration || 'N/A'} days${crop.description ? `, Description: ${crop.description}` : ''}`
    ).join('\n');
};
