// API Route: Mobile Generate RPP (Facade)
// POST /api/mobile/generate-rpp
// This is a WRAPPER for /api/generate - does NOT modify core logic
// Purpose: Simplified input format for Flutter integration

import { NextRequest, NextResponse } from 'next/server';
import { generateCompletion, isGroqConfigured, isRateLimitError } from '@/lib/groq';
import { SYSTEM_PROMPT, buildUserPrompt, parseRPPMResponse } from '@/lib/promptTemplates';
import { getCPTextForPrompt, getPhaseByClass } from '@/data/cp_registry';
import { trackEvent } from '@/lib/metrics';
import { getClientIP, isOwner, checkRateLimit, checkDailyQuota, withTimeout, isTimeoutError } from '@/lib/apiGate';
import type { RPPMInput } from '@/types';

// ============================================================================
// MOBILE REQUEST FORMAT (simplified for Flutter)
// ============================================================================

interface MobileGenerateRequest {
    // Curriculum data
    jenjang: 'SD' | 'SMP' | 'SMA';
    kelas: number;
    mapel: string;
    topik: string;
    detailMateri?: string;
    alokasiWaktu?: string;
    jumlahPertemuan?: number;
    model?: string;

    // Identity data
    namaSekolah: string;
    kepalaSekolah?: string;
    nipKepsek?: string;
    namaGuru: string;
    nipGuru?: string;
    kota?: string;
}

// ============================================================================
// MOBILE ERROR RESPONSE FORMAT
// ============================================================================

interface MobileErrorResponse {
    error: string;
    message: string;
    upgrade_url?: string;
}

// Upgrade URL for paid plans
const UPGRADE_URL = 'https://lynk.id/gurupintar';

/**
 * Transform mobile request format to standard RPPMInput format
 * This is the ONLY transformation - we reuse ALL existing logic
 */
function transformMobileRequest(mobile: MobileGenerateRequest): RPPMInput {
    return {
        identity: {
            namaSekolah: mobile.namaSekolah || 'Sekolah',
            namaKepsek: mobile.kepalaSekolah || '',
            nipKepsek: mobile.nipKepsek || '',
            namaGuru: mobile.namaGuru || 'Guru',
            nipGuru: mobile.nipGuru || '',
            kota: mobile.kota || '',
            tanggalKeabsahan: new Date().toISOString().split('T')[0],
        },
        curriculum: {
            jenjang: mobile.jenjang,
            kelas: mobile.kelas,
            fase: 'fase_A', // Will be determined by getPhaseByClass
            mapel: mobile.mapel,
            topikMateri: mobile.topik,
            detailMateri: mobile.detailMateri || '',
            semester: 'Gasal',
            alokasiWaktu: mobile.alokasiWaktu || '2 x 35 menit',
            jumlahPertemuan: mobile.jumlahPertemuan || 1,
            model: mobile.model || 'PBL',
            kondisiAwalMurid: '',
        }
    };
}

/**
 * Build mobile-friendly error response
 * Standardizes error format for Flutter handling
 */
function buildMobileError(errorType: 'LIMIT_REACHED' | 'TIMEOUT' | 'INVALID_INPUT' | 'SERVER_ERROR', message: string): MobileErrorResponse {
    const response: MobileErrorResponse = {
        error: errorType,
        message: message,
    };

    // Add upgrade URL for limit errors
    if (errorType === 'LIMIT_REACHED') {
        response.upgrade_url = UPGRADE_URL;
    }

    return response;
}

// ============================================================================
// POST /api/mobile/generate-rpp
// ============================================================================

export async function POST(request: NextRequest) {
    // ========================================================================
    // API GATE PROTECTION LAYER (same as /api/generate)
    // ========================================================================
    const clientIP = getClientIP(request);
    const ownerBypass = isOwner(request);

    // Skip all protections for owner
    if (!ownerBypass) {
        // Rate limit check: 30 requests per minute per IP
        const rateCheck = checkRateLimit(clientIP);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                buildMobileError('LIMIT_REACHED', 'Anda telah mencapai batas request per menit. Coba lagi nanti.'),
                { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 60) } }
            );
        }

        // Daily quota check: 300 requests per day per IP
        const quotaCheck = checkDailyQuota(clientIP);
        if (!quotaCheck.allowed) {
            return NextResponse.json(
                buildMobileError('LIMIT_REACHED', 'Anda telah mencapai batas generate harian.'),
                { status: 403 }
            );
        }
    }
    // ========================================================================
    // API GATE PROTECTION LAYER END
    // ========================================================================

    try {
        const mobileBody = await request.json() as MobileGenerateRequest;

        // Validate required fields
        if (!mobileBody.jenjang || !mobileBody.kelas || !mobileBody.mapel || !mobileBody.topik) {
            return NextResponse.json(
                buildMobileError('INVALID_INPUT', 'Data tidak lengkap. Diperlukan: jenjang, kelas, mapel, topik.'),
                { status: 400 }
            );
        }

        if (!mobileBody.namaSekolah || !mobileBody.namaGuru) {
            return NextResponse.json(
                buildMobileError('INVALID_INPUT', 'Data tidak lengkap. Diperlukan: namaSekolah, namaGuru.'),
                { status: 400 }
            );
        }

        // ====================================================================
        // TRANSFORM to standard format - NO LOGIC CHANGE
        // ====================================================================
        const input = transformMobileRequest(mobileBody);

        // ====================================================================
        // REUSE EXISTING LOGIC FROM /api/generate (copy, not import)
        // ====================================================================

        const fase = getPhaseByClass(input.curriculum.jenjang, input.curriculum.kelas);
        const cpText = getCPTextForPrompt(fase || 'fase_A', input.curriculum.mapel);

        const enrichedInput = {
            ...input,
            cpText: cpText || 'Capaian Pembelajaran tidak ditemukan.',
            curriculum: { ...input.curriculum, fase: fase || 'fase_A' }
        };

        // If no API key available at all, return demo content
        if (!isGroqConfigured()) {
            console.warn('⚠️ [Mobile] Groq API not configured. Returning professional demo content.');
            trackEvent('rppm_generated');
            return NextResponse.json({
                success: true,
                rppm: {
                    fullHtml: getDemoHtmlMobile(enrichedInput),
                    generatedAt: new Date().toISOString()
                },
                isDemo: true,
                source: 'mobile'
            });
        }

        const userPrompt = buildUserPrompt(enrichedInput);

        try {
            // Wrap with timeout protection for non-owners (25s max)
            const groqCall = generateCompletion(SYSTEM_PROMPT, userPrompt, {});
            const aiResponse = ownerBypass ? await groqCall : await withTimeout(groqCall);
            const rppmData = parseRPPMResponse(aiResponse);

            if (!rppmData) {
                return NextResponse.json(
                    buildMobileError('SERVER_ERROR', 'Gagal memproses respons AI.'),
                    { status: 500 }
                );
            }

            trackEvent('rppm_generated');
            return NextResponse.json({
                success: true,
                rppm: rppmData,
                source: 'mobile'
            });

        } catch (genError) {
            // Check if this is a timeout error (504 Gateway Timeout)
            if (isTimeoutError(genError)) {
                return NextResponse.json(
                    buildMobileError('TIMEOUT', 'Request timeout. Server terlalu lama merespons.'),
                    { status: 504 }
                );
            }
            // Check if this is a rate limit error from Groq
            if (isRateLimitError(genError) || (genError instanceof Error && genError.message === 'API_RATE_LIMIT')) {
                return NextResponse.json(
                    buildMobileError('LIMIT_REACHED', 'Batas pemakaian API tercapai.'),
                    { status: 429 }
                );
            }
            throw genError; // Re-throw for general error handling
        }

    } catch (error) {
        console.error('[Mobile] Generate API error:', error);
        return NextResponse.json(
            buildMobileError('SERVER_ERROR', 'Terjadi kesalahan sistem.'),
            { status: 500 }
        );
    }
}

// ============================================================================
// DEMO HTML (simplified version for mobile)
// ============================================================================

function getDemoHtmlMobile(data: any): string {
    const faseDisplay = data.curriculum.fase?.replace('fase_', '').toUpperCase() || 'B';
    const topik = data.curriculum.topikMateri || 'Materi Pembelajaran';
    const mapel = data.curriculum.mapel || 'Mata Pelajaran';
    const sekolah = data.identity.namaSekolah || 'Sekolah';
    const guru = data.identity.namaGuru || 'Guru';
    const kelas = data.curriculum.kelas || '4';
    const alokasi = data.curriculum.alokasiWaktu || '2 x 35 menit';
    const model = data.curriculum.model || 'PBL';

    return `
    <div style="font-family: 'Times New Roman', serif; max-width: 900px; margin: auto; padding: 20px; line-height: 1.6; color: black;">
        <h1 style="text-align: center; font-size: 18pt; margin-bottom: 0;">PERENCANAAN PEMBELAJARAN MENDALAM</h1>
        <p style="text-align: center; font-style: italic; color: #666;">(Demo - Mobile Generated)</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12pt;" border="1">
            <tr>
                <th style="padding: 10px; text-align: center;">Satuan Pendidikan</th>
                <th style="padding: 10px; text-align: center;">Fase/Kelas</th>
                <th style="padding: 10px; text-align: center;">Mapel/Materi</th>
                <th style="padding: 10px; text-align: center;">Alokasi Waktu</th>
            </tr>
            <tr>
                <td style="padding: 10px; text-align: center;">${sekolah}</td>
                <td style="padding: 10px; text-align: center;">${faseDisplay} / Kelas ${kelas}</td>
                <td style="padding: 10px; text-align: center;">${mapel}, Topik ${topik}</td>
                <td style="padding: 10px; text-align: center;">${alokasi}</td>
            </tr>
        </table>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">I. IDENTIFIKASI</h2>
        
        <p><strong>A. Identifikasi Murid</strong></p>
        <p style="text-align: justify;">Murid memiliki pengetahuan dasar tentang materi ini. Murid mengetahui cara mencari informasi menggunakan sumber daring.</p>

        <p><strong>B. Identifikasi Karakter Materi</strong></p>
        <p><strong>Capaian pembelajaran:</strong></p>
        <p style="text-align: justify;">Capaian Pembelajaran sesuai kurikulum Kemendikdasmen untuk ${mapel} Fase ${faseDisplay}.</p>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">II. DESAIN PEMBELAJARAN</h2>
        
        <p><strong>Model Pembelajaran:</strong> ${model}</p>
        <p><strong>Metode:</strong> Menyimak, diskusi kelompok, presentasi</p>
        <p><strong>Media:</strong> PPT, video pembelajaran, LKPD</p>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">III. PENGALAMAN PEMBELAJARAN</h2>
        
        <p><strong>A. Pendahuluan (10 menit)</strong></p>
        <ol>
            <li>Guru memberikan salam dan apersepsi</li>
            <li>Guru menyampaikan tujuan pembelajaran</li>
        </ol>

        <p><strong>B. Kegiatan Inti (50 menit)</strong></p>
        <ol>
            <li>Orientasi terhadap masalah</li>
            <li>Mengorganisasi murid untuk belajar</li>
            <li>Membimbing penyelidikan</li>
            <li>Mengembangkan dan menyajikan hasil karya</li>
        </ol>

        <p><strong>C. Penutup (10 menit)</strong></p>
        <ol>
            <li>Kesimpulan bersama</li>
            <li>Refleksi dan tindak lanjut</li>
        </ol>

        <div style="margin-top: 40px; width: 100%;">
            <table style="width: 100%; border: none;">
                <tr>
                    <td style="width: 50%; text-align: center; vertical-align: top;">
                        Mengetahui,<br>Kepala Sekolah<br><br><br><br>
                        <strong>${data.identity.namaKepsek || '.....................'}</strong>
                    </td>
                    <td style="width: 50%; text-align: center; vertical-align: top;">
                        Guru Mata Pelajaran<br><br><br><br>
                        <strong>${guru}</strong>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    `;
}
