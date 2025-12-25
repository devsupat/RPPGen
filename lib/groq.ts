// Groq AI SDK Configuration
// Model: llama3-70b-8192 (Primary) atau llama-3.1-8b (Fallback)
// Per PRD v4.0

import Groq from 'groq-sdk';

// AI Models per PRD - Updated to current Groq supported models
export const AI_MODEL_PRIMARY = 'llama-3.3-70b-versatile';
export const AI_MODEL_FALLBACK = 'llama-3.1-8b-instant';

// Generation settings - INCREASED for complete RPPM document
export const GENERATION_CONFIG = {
    temperature: 0.7,
    max_tokens: 16384, // Increased from 4096 to generate complete rubrik tables
    top_p: 0.9,
};

/**
 * Create a Groq client with the specified API key
 */
function createGroqClient(apiKey: string): Groq {
    return new Groq({ apiKey });
}

/**
 * Check if Groq API is configured (server-side)
 */
export function isGroqConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}

/**
 * Check if an error is a rate limit error (429 or quota exceeded)
 */
export function isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        // Check for common rate limit indicators
        if (
            message.includes('rate limit') ||
            message.includes('rate_limit') ||
            message.includes('quota') ||
            message.includes('too many requests') ||
            message.includes('429')
        ) {
            return true;
        }
    }
    // Check for HTTP 429 status
    if (typeof error === 'object' && error !== null) {
        const anyError = error as Record<string, unknown>;
        if (anyError.status === 429 || anyError.statusCode === 429) {
            return true;
        }
    }
    return false;
}

/**
 * Generate completion with automatic fallback
 * @param systemPrompt System prompt for AI
 * @param userPrompt User prompt for AI
 * @param options Optional configuration including userApiKey
 */
export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
        userApiKey?: string; // User-provided API key (from localStorage)
    }
): Promise<string> {
    // Use user API key if provided, otherwise use server API key
    const apiKey = options?.userApiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not set');
    }

    const groq = createGroqClient(apiKey);

    const config = {
        ...GENERATION_CONFIG,
        temperature: options?.temperature ?? GENERATION_CONFIG.temperature,
        max_tokens: options?.maxTokens ?? GENERATION_CONFIG.max_tokens,
    };

    try {
        // Try primary model first
        const response = await groq.chat.completions.create({
            model: AI_MODEL_PRIMARY,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            top_p: config.top_p,
        });

        return response.choices[0]?.message?.content || '';

    } catch (primaryError) {
        // If rate limit error, throw immediately with special flag
        if (isRateLimitError(primaryError)) {
            const rateLimitErr = new Error('API_RATE_LIMIT');
            (rateLimitErr as Error & { isRateLimit: boolean }).isRateLimit = true;
            throw rateLimitErr;
        }

        console.warn(`Primary model (${AI_MODEL_PRIMARY}) failed, trying fallback...`, primaryError);

        // Fallback to smaller model
        try {
            const response = await groq.chat.completions.create({
                model: AI_MODEL_FALLBACK,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: config.temperature,
                max_tokens: config.max_tokens,
                top_p: config.top_p,
            });

            return response.choices[0]?.message?.content || '';

        } catch (fallbackError) {
            // Check if fallback also hit rate limit
            if (isRateLimitError(fallbackError)) {
                const rateLimitErr = new Error('API_RATE_LIMIT');
                (rateLimitErr as Error & { isRateLimit: boolean }).isRateLimit = true;
                throw rateLimitErr;
            }

            console.error('Both AI models failed:', fallbackError);
            throw new Error('Gagal menghasilkan RPPM. Silakan coba lagi.');
        }
    }
}

