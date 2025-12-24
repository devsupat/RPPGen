// Groq AI SDK Configuration
// Model: llama3-70b-8192 (Primary) atau mixtral-8x7b (Fallback)
// Per PRD v4.0

import Groq from 'groq-sdk';

// Lazy-initialized Groq client to avoid build-time errors
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groqClient;
}

// AI Models per PRD - Updated to current Groq supported models
export const AI_MODEL_PRIMARY = 'llama-3.3-70b-versatile';
export const AI_MODEL_FALLBACK = 'llama-3.1-8b-instant';

// Generation settings
export const GENERATION_CONFIG = {
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 0.9,
};

/**
 * Check if Groq API is configured
 */
export function isGroqConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}

/**
 * Generate completion with automatic fallback
 */
export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> {
    const groq = getGroqClient();

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
        console.warn(`Primary model (${AI_MODEL_PRIMARY}) failed, trying fallback...`, primaryError);

        // Fallback to mixtral
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
            console.error('Both AI models failed:', fallbackError);
            throw new Error('Gagal menghasilkan RPPM. Silakan coba lagi.');
        }
    }
}
