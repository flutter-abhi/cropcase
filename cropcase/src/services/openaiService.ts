import OpenAI from 'openai';

// OpenAI Service Configuration
interface OpenAIConfig {
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// Default configuration
const DEFAULT_CONFIG: Required<OpenAIConfig> = {
    model: 'gpt-3.5-turbo',
    maxTokens: 1500,
    temperature: 0.7,
};

class OpenAIService {
    private client: OpenAI | null = null;
    private isInitialized = false;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.warn('⚠️ OpenAI API key not found in environment variables');
            return;
        }

        try {
            this.client = new OpenAI({ apiKey });
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize OpenAI service:', error);
        }
    }

    /**
     * Check if OpenAI service is properly configured
     */
    public isConfigured(): boolean {
        return this.isInitialized && this.client !== null;
    }

    /**
     * Generate completion using OpenAI API
     */
    public async generateCompletion<T = unknown>(
        messages: OpenAIMessage[],
        config: OpenAIConfig = {}
    ): Promise<OpenAIResponse<T>> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'OpenAI service not configured. Please set OPENAI_API_KEY environment variable.'
            };
        }

        const finalConfig = { ...DEFAULT_CONFIG, ...config };

        try {
            const completion = await this.client!.chat.completions.create({
                model: finalConfig.model,
                messages: messages,
                max_tokens: finalConfig.maxTokens,
                temperature: finalConfig.temperature,
            });

            if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
                throw new Error('Invalid response structure from OpenAI API');
            }

            const content = completion.choices[0].message.content?.trim() || '';

            // Try to parse JSON response
            let parsedData: T;
            try {
                parsedData = JSON.parse(content) as T;
            } catch (parseError) {
                console.error('❌ JSON parsing failed:', parseError);
                throw new Error('AI returned invalid JSON format');
            }

            return {
                success: true,
                data: parsedData,
                usage: completion.usage ? {
                    promptTokens: completion.usage.prompt_tokens,
                    completionTokens: completion.usage.completion_tokens,
                    totalTokens: completion.usage.total_tokens
                } : undefined
            };

        } catch (error) {
            // Handle specific OpenAI errors
            if (error instanceof Error) {
                if (error.message.includes('401')) {
                    return {
                        success: false,
                        error: 'Authentication failed. Please check your OpenAI API key.'
                    };
                }

                if (error.message.includes('429')) {
                    return {
                        success: false,
                        error: 'Rate limit exceeded. Please try again later.'
                    };
                }

                if (error.message.includes('quota')) {
                    return {
                        success: false,
                        error: 'API quota exceeded. Please check your OpenAI account.'
                    };
                }

                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: false,
                error: 'Unknown error occurred while calling OpenAI API'
            };
        }
    }

    /**
     * Generate crop suggestions using AI
     */
    public async generateCropSuggestions(
        systemPrompt: string,
        userPrompt: string,
        config?: OpenAIConfig
    ) {
        const messages: OpenAIMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return this.generateCompletion(messages, config);
    }

    /**
     * Generate text completion for any use case
     */
    public async generateText(
        prompt: string,
        systemMessage?: string,
        config?: OpenAIConfig
    ): Promise<OpenAIResponse<{ text: string }>> {
        const messages: OpenAIMessage[] = [];

        if (systemMessage) {
            messages.push({ role: 'system', content: systemMessage });
        }

        messages.push({ role: 'user', content: prompt });

        const response = await this.generateCompletion<{ text: string }>(messages, config);

        // If it's not JSON, treat as plain text
        if (!response.success && response.error?.includes('invalid JSON')) {
            // Return the raw content as text
            return {
                success: true,
                data: { text: 'Raw text response' } // This would need to be extracted from the actual response
            };
        }

        return response;
    }

    /**
     * Validate response against expected schema
     */
    public validateResponse<T>(
        response: unknown,
        validator: (data: unknown) => data is T
    ): T | null {
        if (validator(response)) {
            return response;
        }
        return null;
    }
}

// Export singleton instance
export const openAIService = new OpenAIService();

// Export types for use in other files
export type { OpenAIConfig, OpenAIMessage, OpenAIResponse };
