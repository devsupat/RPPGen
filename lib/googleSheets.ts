// Google Sheets Integration for Authentication
// Satu-satunya sistem autentikasi - No other database

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ============================================
// Configuration
// ============================================

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
];

// Sheet column names (matching user's spreadsheet structure)
// | Access_Code | Nama | Role | Device_Hash | Last_Login |

interface UserRow {
    Access_Code: string;
    Nama: string;
    Role: string;
    Device_Hash: string;
    Last_Login: string;
}

// ============================================
// Initialize Google Sheets Connection
// ============================================

let docInstance: GoogleSpreadsheet | null = null;

async function getDoc(): Promise<GoogleSpreadsheet> {
    if (docInstance) return docInstance;

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Handle private key - may have escaped newlines as literal \\n or as \n
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    // Replace literal \\n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
    }
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
        throw new Error('Missing Google Sheets configuration. Check environment variables.');
    }

    const jwt = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: SCOPES,
    });

    try {
        const doc = new GoogleSpreadsheet(sheetId, jwt);
        await doc.loadInfo();
        docInstance = doc; // Only cache after successful load
        return doc;
    } catch (error) {
        // Reset cache on failure so next attempt tries fresh
        docInstance = null;
        throw error;
    }
}

// ============================================
// User Authentication Functions
// ============================================

export interface AuthResult {
    success: boolean;
    user?: {
        kodeAkses: string;
        nama: string;
        sekolah: string;
        deviceHash: string;
    };
    error?: string;
    errorCode?: 'INVALID_CODE' | 'DEVICE_LOCKED' | 'SYSTEM_ERROR';
}

/**
 * Validate access code and check device lock
 * 
 * Device Lock Logic (per PRD):
 * - Jika kode valid & Device_Hash kosong → Izinkan + Kunci Device_Hash
 * - Jika kode valid & Device_Hash sama → Izinkan
 * - Jika kode valid & Device_Hash berbeda → BLOKIR
 */
export async function validateAccessCode(
    accessCode: string,
    deviceHash: string
): Promise<AuthResult> {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0]; // First sheet = Users

        if (!sheet) {
            return {
                success: false,
                error: 'Sheet tidak ditemukan',
                errorCode: 'SYSTEM_ERROR'
            };
        }

        const rows = await sheet.getRows<UserRow>();
        const userRow = rows.find(
            (row) => row.get('Access_Code') === accessCode
        );

        if (!userRow) {
            return {
                success: false,
                error: 'Kode akses tidak valid',
                errorCode: 'INVALID_CODE'
            };
        }

        const storedDeviceHash = userRow.get('Device_Hash') || '';
        const userName = userRow.get('Nama') || '';
        const userRole = userRow.get('Role') || 'Teacher';

        // Case 1: First login (Device_Hash empty) - Lock to this device
        if (!storedDeviceHash) {
            await lockDeviceToUser(userRow, deviceHash);

            return {
                success: true,
                user: {
                    kodeAkses: accessCode,
                    nama: userName,
                    sekolah: userRole, // Using Role as identifier for now
                    deviceHash: deviceHash
                }
            };
        }

        // Case 2: Same device - Allow access
        if (storedDeviceHash === deviceHash) {
            // Update last login
            await updateLastLogin(userRow);

            return {
                success: true,
                user: {
                    kodeAkses: accessCode,
                    nama: userName,
                    sekolah: userRole,
                    deviceHash: deviceHash
                }
            };
        }

        // Case 3: Different device - BLOCK
        return {
            success: false,
            error: 'Akun sedang digunakan di perangkat lain. Hubungi admin untuk reset.',
            errorCode: 'DEVICE_LOCKED'
        };

    } catch (error) {
        console.error('Auth error:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan sistem. Silakan coba lagi.',
            errorCode: 'SYSTEM_ERROR'
        };
    }
}

/**
 * Lock device hash to user (first login)
 */
async function lockDeviceToUser(
    userRow: GoogleSpreadsheetRow<UserRow>,
    deviceHash: string
): Promise<void> {
    userRow.set('Device_Hash', deviceHash);
    userRow.set('Last_Login', new Date().toISOString());
    await userRow.save();
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(
    userRow: GoogleSpreadsheetRow<UserRow>
): Promise<void> {
    userRow.set('Last_Login', new Date().toISOString());
    await userRow.save();
}

/**
 * Admin function: Reset device lock for a user
 * (This would be called from an admin interface or directly on Google Sheets)
 */
export async function resetDeviceLock(accessCode: string): Promise<boolean> {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0];

        if (!sheet) return false;

        const rows = await sheet.getRows<UserRow>();
        const userRow = rows.find(
            (row) => row.get('Access_Code') === accessCode
        );

        if (!userRow) return false;

        userRow.set('Device_Hash', '');
        await userRow.save();

        return true;
    } catch (error) {
        console.error('Reset device lock error:', error);
        return false;
    }
}

/**
 * Check if Google Sheets is configured
 */
export function isGoogleSheetsConfigured(): boolean {
    return !!(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY &&
        process.env.GOOGLE_SHEET_ID
    );
}
