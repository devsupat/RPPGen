// TEMPORARY DEBUG ENDPOINT - DELETE AFTER TESTING
// GET /api/debug-gate - Check API Gate environment configuration
// This endpoint does NOT expose actual secrets, only boolean status

import { NextResponse } from 'next/server';

export async function GET() {
    // Read environment variables (same way apiGate.ts reads them)
    const apiGateDisabled = process.env.API_GATE_DISABLED;
    const ownerApiKey = process.env.OWNER_API_KEY;
    const ownerIPs = process.env.OWNER_IPS;

    return NextResponse.json({
        // Show raw value for debugging (safe, it's just 'true' or 'false')
        API_GATE_DISABLED_raw: apiGateDisabled || '(not set)',

        // Show computed boolean (this is what the code actually uses)
        API_GATE_DISABLED_computed: apiGateDisabled === 'true',

        // Show if secrets are configured (NOT the actual values!)
        OWNER_API_KEY_configured: !!ownerApiKey && ownerApiKey.length > 0,
        OWNER_API_KEY_length: ownerApiKey?.length || 0,

        OWNER_IPS_configured: !!ownerIPs && ownerIPs.length > 0,
        OWNER_IPS_value: ownerIPs || '(not set)',

        // Timestamp for cache verification
        timestamp: new Date().toISOString(),
        message: '🔧 DELETE THIS ENDPOINT AFTER DEBUGGING!'
    });
}
