// API Route: Generate RPPM
// POST /api/generate - Generate RPPM using Groq AI with CP context
// Privacy First: Data is NOT stored on server

import { NextRequest, NextResponse } from 'next/server';
import { generateCompletion, isGroqConfigured } from '@/lib/groq';
import { SYSTEM_PROMPT, buildUserPrompt, parseRPPMResponse } from '@/lib/promptTemplates';
import { getCPTextForPrompt, getPhaseByClass, isValidSubjectForPhase } from '@/data/cp_registry';
import { trackEvent } from '@/lib/metrics';
import type { RPPMInput, PhaseName } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = body as RPPMInput;

        // Validate input
        const validation = validateInput(input);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Get phase from class
        const fase = getPhaseByClass(input.curriculum.jenjang, input.curriculum.kelas);
        if (!fase) {
            return NextResponse.json(
                { success: false, error: 'Kombinasi jenjang dan kelas tidak valid' },
                { status: 400 }
            );
        }

        // Validate subject exists for this phase
        if (!isValidSubjectForPhase(fase, input.curriculum.mapel)) {
            return NextResponse.json(
                { success: false, error: `Mata pelajaran "${input.curriculum.mapel}" tidak tersedia untuk ${fase}` },
                { status: 400 }
            );
        }

        // Get CP text for prompt
        const cpText = getCPTextForPrompt(fase, input.curriculum.mapel);
        if (!cpText) {
            return NextResponse.json(
                { success: false, error: 'Capaian Pembelajaran tidak ditemukan' },
                { status: 404 }
            );
        }

        // Add fase to input for prompt building
        const inputWithFase: RPPMInput = {
            ...input,
            curriculum: {
                ...input.curriculum,
                fase: fase
            }
        };

        // Check if Groq is configured
        if (!isGroqConfigured()) {
            console.warn('⚠️ Groq API not configured. Returning demo data.');
            // Track demo generation
            trackEvent('rppm_generated');
            return NextResponse.json({
                success: true,
                rppm: getDemoRPPM(inputWithFase),
                isDemo: true
            });
        }

        // Build prompt
        const userPrompt = buildUserPrompt(inputWithFase, cpText);

        // Generate with AI
        const aiResponse = await generateCompletion(SYSTEM_PROMPT, userPrompt);

        // Parse response
        const rppmData = parseRPPMResponse(aiResponse);
        if (!rppmData) {
            return NextResponse.json(
                { success: false, error: 'Gagal memproses respons AI. Silakan coba lagi.' },
                { status: 500 }
            );
        }

        // Build complete RPPM output
        const rppmOutput = {
            ...rppmData,
            // Add identity fields from input
            sekolah: input.identity.namaSekolah,
            kepsek: {
                nama: input.identity.namaKepsek,
                nip: input.identity.nipKepsek
            },
            guru: {
                nama: input.identity.namaGuru,
                nip: input.identity.nipGuru
            },
            mapel: input.curriculum.mapel,
            kelas: `${input.curriculum.jenjang} Kelas ${input.curriculum.kelas}`,
            fase: fase.replace('fase_', 'Fase '),
            topik: input.curriculum.topikMateri,
            // Include CP reference
            capaianPembelajaran: getCPElements(fase, input.curriculum.mapel)
        };

        // Return generated RPPM
        // NOTE: This data is NOT stored. Generate → Download → Forget
        // Track successful generation
        trackEvent('rppm_generated');

        return NextResponse.json({
            success: true,
            rppm: rppmOutput
        });

    } catch (error) {
        console.error('Generate API error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat menghasilkan RPPM' },
            { status: 500 }
        );
    }
}

// ============================================
// Validation
// ============================================

function validateInput(input: RPPMInput): { valid: boolean; error?: string } {
    if (!input.identity) {
        return { valid: false, error: 'Data identitas tidak lengkap' };
    }

    if (!input.identity.namaSekolah) {
        return { valid: false, error: 'Nama sekolah harus diisi' };
    }

    if (!input.identity.namaKepsek || !input.identity.nipKepsek) {
        return { valid: false, error: 'Nama dan NIP Kepala Sekolah harus diisi' };
    }

    if (!input.identity.namaGuru) {
        return { valid: false, error: 'Nama guru harus diisi' };
    }

    if (!input.curriculum) {
        return { valid: false, error: 'Data kurikulum tidak lengkap' };
    }

    if (!input.curriculum.jenjang || !input.curriculum.kelas) {
        return { valid: false, error: 'Jenjang dan kelas harus dipilih' };
    }

    if (!input.curriculum.mapel) {
        return { valid: false, error: 'Mata pelajaran harus dipilih' };
    }

    if (!input.curriculum.topikMateri) {
        return { valid: false, error: 'Topik materi harus diisi' };
    }

    return { valid: true };
}

// ============================================
// Helper Functions
// ============================================

function getCPElements(fase: PhaseName, mapel: string): Record<string, string> {
    const { getCPByPhaseAndSubject } = require('@/data/cp_registry');
    const cp = getCPByPhaseAndSubject(fase, mapel);
    return cp?.elemen || {};
}

function getDemoRPPM(input: RPPMInput): Record<string, unknown> {
    return {
        judul: `Rencana Pembelajaran Mendalam: ${input.curriculum.topikMateri}`,
        sekolah: input.identity.namaSekolah,
        kepsek: {
            nama: input.identity.namaKepsek,
            nip: input.identity.nipKepsek
        },
        guru: {
            nama: input.identity.namaGuru,
            nip: input.identity.nipGuru
        },
        mapel: input.curriculum.mapel,
        kelas: `${input.curriculum.jenjang} Kelas ${input.curriculum.kelas}`,
        fase: input.curriculum.fase?.replace('fase_', 'Fase ') || '',
        topik: input.curriculum.topikMateri,
        identifikasi: {
            karakteristikMurid: '[Demo] Murid pada fase ini memiliki karakteristik perkembangan yang aktif dan senang belajar melalui pengalaman langsung.',
            karakterMateri: '[Demo] Materi ini memiliki tingkat kompleksitas sedang dan memerlukan pemahaman konseptual.',
            dimensiProfilLulusan: ['Bernalar Kritis', 'Kreatif', 'Bergotong-royong']
        },
        desainPembelajaran: {
            model: 'PBL',
            pendekatanDeepLearning: {
                berkesadaran: '[Demo] Murid diajak untuk menyadari relevansi materi dengan kehidupan sehari-hari.',
                bermakna: '[Demo] Pembelajaran dikaitkan dengan pengalaman nyata murid di lingkungan sekitar.',
                menggembirakan: '[Demo] Menggunakan permainan edukatif dan diskusi kelompok interaktif.'
            },
            pemanfaatanDigital: ['Youtube', 'Quizizz', 'KBBI Daring']
        },
        pengalamanBelajar: {
            pendahuluan: ['[Demo] Guru menyapa murid dan melakukan ice breaking (Membangun suasana, Menggembirakan)'],
            kegiatan_inti: [
                {
                    deskripsi: '[Demo] Murid mengamati video pembelajaran terkait topik',
                    labelKompetensi: 'Mengamati, Berkesadaran'
                },
                {
                    deskripsi: '[Demo] Murid berdiskusi dalam kelompok kecil',
                    labelKompetensi: 'Menganalisis, Bermakna'
                }
            ],
            penutup: ['[Demo] Refleksi pembelajaran dan kesimpulan bersama']
        },
        rubrikPenilaian: [
            { level: 'Prestructural', deskripsi: '[Demo] Murid belum memahami konsep dasar', indikator: 'Memberikan respons yang tidak relevan' },
            { level: 'Unistructural', deskripsi: '[Demo] Murid memahami satu aspek', indikator: 'Dapat menyebutkan satu contoh' },
            { level: 'Multistructural', deskripsi: '[Demo] Murid memahami beberapa aspek', indikator: 'Dapat menyebutkan beberapa contoh' },
            { level: 'Relational', deskripsi: '[Demo] Murid menghubungkan aspek-aspek', indikator: 'Dapat menjelaskan hubungan antar konsep' },
            { level: 'Extended Abstract', deskripsi: '[Demo] Murid dapat menggeneralisasi', indikator: 'Dapat menerapkan konsep ke situasi baru' }
        ],
        capaianPembelajaran: {}
    };
}
