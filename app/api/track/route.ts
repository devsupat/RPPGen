// API Route: Track Events
// POST /api/track - Track anonymous usage events
// Privacy: Only event types are logged, no personal data

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, MetricEvent } from '@/lib/metrics';

const ALLOWED_EVENTS: MetricEvent[] = ['visit', 'docx_export', 'pdf_export'];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event } = body;

        // Only allow specific client-side events
        if (!event || !ALLOWED_EVENTS.includes(event)) {
            return NextResponse.json(
                { success: false, error: 'Invalid event' },
                { status: 400 }
            );
        }

        // Track the event (non-blocking)
        trackEvent(event);

        return NextResponse.json({ success: true });
    } catch {
        // Silently fail - don't impact user experience
        return NextResponse.json({ success: true });
    }
}
