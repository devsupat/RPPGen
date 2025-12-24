// API Route: Authentication
// POST /api/auth - Validate access code with device lock

import { NextRequest, NextResponse } from 'next/server';
import { validateAccessCode, isGoogleSheetsConfigured } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { accessCode, deviceHash } = body;

        // Validate input
        if (!accessCode || typeof accessCode !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Kode akses harus diisi' },
                { status: 400 }
            );
        }

        if (!deviceHash || typeof deviceHash !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Device hash tidak valid' },
                { status: 400 }
            );
        }

        // Check if Google Sheets is configured
        if (!isGoogleSheetsConfigured()) {
            // Demo mode: allow any access code for development
            console.warn('⚠️ Google Sheets not configured. Running in DEMO mode.');

            return NextResponse.json({
                success: true,
                user: {
                    kodeAkses: accessCode,
                    nama: 'Guru Demo',
                    sekolah: 'SD Demo',
                    deviceHash: deviceHash
                },
                isDemo: true
            });
        }

        // Validate with Google Sheets
        const result = await validateAccessCode(accessCode.trim(), deviceHash);

        if (result.success) {
            return NextResponse.json({
                success: true,
                user: result.user
            });
        } else {
            // Return appropriate error
            const statusCode = result.errorCode === 'DEVICE_LOCKED' ? 403 : 401;
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    errorCode: result.errorCode
                },
                { status: statusCode }
            );
        }

    } catch (error) {
        console.error('Auth API error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
