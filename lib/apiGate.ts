// API Gate Protection Layer
// Provides: Rate limiting, Daily quota, Timeout protection, Owner bypass
// This module wraps existing Groq calls without modifying any existing logic

import { NextRequest } from 'next/server';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Protection limits for non-owner requests
const RATE_LIMIT_PER_MINUTE = 30;  // Max requests per minute per IP
const DAILY_QUOTA_PER_IP = 300;    // Max requests per day per IP
const TIMEOUT_MS = 25000;          // 25 seconds timeout for Groq requests

// ============================================================================
// IN-MEMORY STORES
// Note: These reset on server restart. For production, consider Redis.
// ============================================================================

// Rate limit store: { [ip]: { count: number, resetTime: number } }
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Daily quota store: { [ip]: { count: number, resetDate: string } }
const dailyQuotaStore = new Map<string, { count: number; resetDate: string }>();

// ============================================================================
// IP EXTRACTION
// ============================================================================

/**
 * Extract client IP from request headers
 * Handles proxied requests (x-forwarded-for, x-real-ip)
 */
export function getClientIP(request: NextRequest): string {
    // Try x-forwarded-for first (common for proxies/load balancers)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP in the chain (original client)
        return forwardedFor.split(',')[0].trim();
    }

    // Try x-real-ip (Nginx proxy)
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP.trim();
    }

    // Fallback to connection remote address (may not always be available)
    // In Next.js, this might not be directly accessible, default to localhost
    return '127.0.0.1';
}

// ============================================================================
// OWNER BYPASS
// ============================================================================

/**
 * Check if the request is from an owner (bypasses all protections)
 * Owner is determined by:
 * 1. IP is in OWNER_IPS environment variable (comma-separated)
 * 2. OR x-owner-key header matches OWNER_API_KEY environment variable
 */
export function isOwner(request: NextRequest): boolean {
    const clientIP = getClientIP(request);

    // Check OWNER_IPS environment variable
    const ownerIPs = process.env.OWNER_IPS?.split(',').map(ip => ip.trim()) || [];
    if (ownerIPs.includes(clientIP)) {
        return true;
    }

    // Check x-owner-key header
    const ownerKey = request.headers.get('x-owner-key');
    const configuredKey = process.env.OWNER_API_KEY;
    if (ownerKey && configuredKey && ownerKey === configuredKey) {
        return true;
    }

    return false;
}

// ============================================================================
// RATE LIMITING (per minute)
// ============================================================================

/**
 * Check and update rate limit for an IP
 * Allows RATE_LIMIT_PER_MINUTE requests per minute per IP
 * Returns { allowed: true } if under limit, { allowed: false, retryAfter } if exceeded
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    const record = rateLimitStore.get(ip);

    // No record or window expired: create new record
    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    // Within window: check count
    if (record.count >= RATE_LIMIT_PER_MINUTE) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
    }

    // Under limit: increment and allow
    record.count++;
    return { allowed: true };
}

// ============================================================================
// DAILY QUOTA
// ============================================================================

/**
 * Get today's date string in YYYY-MM-DD format (UTC)
 */
function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check and update daily quota for an IP
 * Allows DAILY_QUOTA_PER_IP requests per day per IP
 * Returns { allowed: true, remaining } if under quota, { allowed: false } if exceeded
 */
export function checkDailyQuota(ip: string): { allowed: boolean; remaining?: number } {
    const today = getTodayString();
    const record = dailyQuotaStore.get(ip);

    // No record or new day: create new record
    if (!record || record.resetDate !== today) {
        dailyQuotaStore.set(ip, { count: 1, resetDate: today });
        return { allowed: true, remaining: DAILY_QUOTA_PER_IP - 1 };
    }

    // Same day: check quota
    if (record.count >= DAILY_QUOTA_PER_IP) {
        return { allowed: false };
    }

    // Under quota: increment and allow
    record.count++;
    return { allowed: true, remaining: DAILY_QUOTA_PER_IP - record.count };
}

// ============================================================================
// TIMEOUT PROTECTION
// ============================================================================

/**
 * Wrap a promise with a timeout
 * If the promise doesn't resolve within `ms` milliseconds, rejects with timeout error
 */
export async function withTimeout<T>(promise: Promise<T>, ms: number = TIMEOUT_MS): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('GATEWAY_TIMEOUT'));
        }, ms);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}

// ============================================================================
// UTILITY: Check if error is a timeout error
// ============================================================================

/**
 * Check if an error is a gateway timeout error from withTimeout
 */
export function isTimeoutError(error: unknown): boolean {
    return error instanceof Error && error.message === 'GATEWAY_TIMEOUT';
}
