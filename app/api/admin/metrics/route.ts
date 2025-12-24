// Internal Metrics Endpoint
// GET /__internal/metrics?token=SECRET_TOKEN
// Protected admin-only endpoint for viewing usage statistics

import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSummary } from '@/lib/metrics';

export async function GET(request: NextRequest) {
    // Get token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate token
    const secretToken = process.env.METRICS_SECRET_TOKEN;

    if (!secretToken) {
        return NextResponse.json(
            { error: 'Metrics not configured' },
            { status: 503 }
        );
    }

    if (!token || token !== secretToken) {
        // Return generic 404 to hide endpoint existence
        return NextResponse.json(
            { error: 'Not Found' },
            { status: 404 }
        );
    }

    try {
        const summary = await getMetricsSummary();

        if (!summary) {
            return NextResponse.json(
                { error: 'Failed to retrieve metrics' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            metrics: summary,
            generated_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Metrics endpoint error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
