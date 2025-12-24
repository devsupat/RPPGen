// Browser Fingerprinting for Device Lock
// Using FingerprintJS for unique device identification

import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<import('@fingerprintjs/fingerprintjs').Agent> | null = null;

/**
 * Initialize FingerprintJS agent
 * Should be called on client-side only
 */
function getAgent(): Promise<import('@fingerprintjs/fingerprintjs').Agent> {
    if (!fpPromise) {
        fpPromise = FingerprintJS.load();
    }
    return fpPromise;
}

/**
 * Get unique device fingerprint hash
 * This creates a unique identifier for the browser/device
 * 
 * @returns Promise<string> - Unique visitor ID hash
 */
export async function getDeviceFingerprint(): Promise<string> {
    try {
        const agent = await getAgent();
        const result = await agent.get();

        // visitorId is the unique fingerprint
        return result.visitorId;
    } catch (error) {
        console.error('Fingerprint error:', error);
        // Fallback: generate a random ID and store in localStorage
        return getFallbackFingerprint();
    }
}

/**
 * Fallback fingerprint if FingerprintJS fails
 * Uses localStorage to persist a random ID
 */
function getFallbackFingerprint(): string {
    const STORAGE_KEY = 'gp_device_id';

    if (typeof window === 'undefined') {
        // Server-side: return empty (will be handled client-side)
        return '';
    }

    let storedId = localStorage.getItem(STORAGE_KEY);

    if (!storedId) {
        // Generate a pseudo-random ID
        storedId = 'fb_' + Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15) +
            '_' + Date.now().toString(36);
        localStorage.setItem(STORAGE_KEY, storedId);
    }

    return storedId;
}

/**
 * Check if we're running on client-side
 */
export function isClient(): boolean {
    return typeof window !== 'undefined';
}
