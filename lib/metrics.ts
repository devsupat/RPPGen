// Internal Metrics Tracking System
// Privacy-first: No personal data, no content, no device info stored
// Only aggregated anonymous counts

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Metric event types
export type MetricEvent =
    | 'visit'
    | 'login'
    | 'rppm_generated'
    | 'docx_export'
    | 'pdf_export';

interface MetricRow {
    event_type: MetricEvent;
    count: number;
    last_update: string;
}

// Cache for metrics doc instance
let metricsSheet: GoogleSpreadsheet | null = null;

// Get or create the metrics sheet
async function getMetricsSheet(): Promise<GoogleSpreadsheet | null> {
    if (metricsSheet) return metricsSheet;

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    privateKey = privateKey.replace(/\\n/g, '\n');
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
    }
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
        console.warn('Metrics: Google Sheets not configured');
        return null;
    }

    try {
        const jwt = new JWT({
            email: serviceAccountEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetId, jwt);
        await doc.loadInfo();
        metricsSheet = doc;
        return doc;
    } catch (error) {
        console.error('Metrics: Failed to connect to Google Sheets', error);
        return null;
    }
}

// Ensure metrics tab exists
async function ensureMetricsTab(): Promise<GoogleSpreadsheetRow[] | null> {
    const doc = await getMetricsSheet();
    if (!doc) return null;

    try {
        // Try to find existing metrics sheet
        let sheet = doc.sheetsByTitle['metrics'];

        if (!sheet) {
            // Create the metrics sheet with headers
            sheet = await doc.addSheet({
                title: 'metrics',
                headerValues: ['event_type', 'count', 'last_update'],
            });

            // Initialize all metric rows
            const initialMetrics: MetricRow[] = [
                { event_type: 'visit', count: 0, last_update: new Date().toISOString() },
                { event_type: 'login', count: 0, last_update: new Date().toISOString() },
                { event_type: 'rppm_generated', count: 0, last_update: new Date().toISOString() },
                { event_type: 'docx_export', count: 0, last_update: new Date().toISOString() },
                { event_type: 'pdf_export', count: 0, last_update: new Date().toISOString() },
            ];

            await sheet.addRows(initialMetrics.map(m => ({
                event_type: m.event_type,
                count: m.count.toString(),
                last_update: m.last_update,
            })));
        }

        const rows = await sheet.getRows();
        return rows;
    } catch (error) {
        console.error('Metrics: Failed to ensure metrics tab', error);
        return null;
    }
}

// Track an event (increment counter)
export async function trackEvent(eventType: MetricEvent): Promise<void> {
    // Run async, don't block the main request
    setImmediate(async () => {
        try {
            const rows = await ensureMetricsTab();
            if (!rows) return;

            const row = rows.find(r => r.get('event_type') === eventType);
            if (row) {
                const currentCount = parseInt(row.get('count') || '0', 10);
                row.set('count', (currentCount + 1).toString());
                row.set('last_update', new Date().toISOString());
                await row.save();
            }
        } catch (error) {
            // Silently fail - metrics should never break the app
            console.error('Metrics: Failed to track event', eventType, error);
        }
    });
}

// Get all metrics (for admin endpoint)
export async function getMetrics(): Promise<Record<string, { count: number; lastUpdate: string }> | null> {
    try {
        const rows = await ensureMetricsTab();
        if (!rows) return null;

        const metrics: Record<string, { count: number; lastUpdate: string }> = {};

        for (const row of rows) {
            const eventType = row.get('event_type');
            if (eventType) {
                metrics[eventType] = {
                    count: parseInt(row.get('count') || '0', 10),
                    lastUpdate: row.get('last_update') || '',
                };
            }
        }

        return metrics;
    } catch (error) {
        console.error('Metrics: Failed to get metrics', error);
        return null;
    }
}

// Get summary for admin
export async function getMetricsSummary(): Promise<{
    total_visits: number;
    total_logins: number;
    total_rppm_generated: number;
    total_docx_exports: number;
    total_pdf_exports: number;
    last_activity: string;
} | null> {
    const metrics = await getMetrics();
    if (!metrics) return null;

    // Find the most recent activity
    let lastActivity = '';
    for (const metric of Object.values(metrics)) {
        if (!lastActivity || metric.lastUpdate > lastActivity) {
            lastActivity = metric.lastUpdate;
        }
    }

    return {
        total_visits: metrics['visit']?.count || 0,
        total_logins: metrics['login']?.count || 0,
        total_rppm_generated: metrics['rppm_generated']?.count || 0,
        total_docx_exports: metrics['docx_export']?.count || 0,
        total_pdf_exports: metrics['pdf_export']?.count || 0,
        last_activity: lastActivity,
    };
}
