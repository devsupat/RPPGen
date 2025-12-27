// API Route: Generate RPPM
// POST /api/generate - Generate RICH CONTENT RPPM using Groq AI
// Standard: Kemendikdasmen SK 046/2025

import { NextRequest, NextResponse } from 'next/server';
import { generateCompletion, isGroqConfigured, isRateLimitError } from '@/lib/groq';
import { SYSTEM_PROMPT, buildUserPrompt, parseRPPMResponse } from '@/lib/promptTemplates';
import { getCPTextForPrompt, getPhaseByClass } from '@/data/cp_registry';
import { trackEvent } from '@/lib/metrics';
import { getClientIP, isOwner, checkRateLimit, checkDailyQuota, withTimeout, isTimeoutError } from '@/lib/apiGate';
import type { RPPMInput } from '@/types';

export async function POST(request: NextRequest) {
    // ========================================================================
    // API GATE PROTECTION LAYER START
    // ========================================================================
    const clientIP = getClientIP(request);
    const ownerBypass = isOwner(request);

    // Skip all protections for owner
    if (!ownerBypass) {
        // Rate limit check: 30 requests per minute per IP
        const rateCheck = checkRateLimit(clientIP);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Coba lagi nanti.' },
                { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 60) } }
            );
        }

        // Daily quota check: 300 requests per day per IP
        const quotaCheck = checkDailyQuota(clientIP);
        if (!quotaCheck.allowed) {
            return NextResponse.json(
                { success: false, error: 'Daily quota exceeded. Kuota harian habis.' },
                { status: 403 }
            );
        }
    }
    // ========================================================================
    // API GATE PROTECTION LAYER END
    // ========================================================================

    try {
        const body = await request.json();
        const input = body as RPPMInput & { userApiKey?: string };

        // Extract user API key (sent from client localStorage, never logged)
        const userApiKey = body.userApiKey;

        if (!input.identity || !input.curriculum) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        const fase = getPhaseByClass(input.curriculum.jenjang, input.curriculum.kelas);
        const cpText = getCPTextForPrompt(fase || 'fase_A', input.curriculum.mapel);

        const enrichedInput = {
            ...input,
            cpText: cpText || 'Capaian Pembelajaran tidak ditemukan.',
            curriculum: { ...input.curriculum, fase: fase || 'fase_A' }
        };

        // If no API key available at all, return demo content
        if (!isGroqConfigured() && !userApiKey) {
            console.warn('⚠️ Groq API not configured. Returning professional demo content.');
            trackEvent('rppm_generated');
            return NextResponse.json({
                success: true,
                rppm: {
                    fullHtml: getDemoHtml(enrichedInput),
                    generatedAt: new Date().toISOString()
                },
                isDemo: true
            });
        }

        const userPrompt = buildUserPrompt(enrichedInput);

        try {
            // Wrap with timeout protection for non-owners (25s max)
            const groqCall = generateCompletion(SYSTEM_PROMPT, userPrompt, {
                userApiKey: userApiKey // Pass user API key if provided
            });
            const aiResponse = ownerBypass ? await groqCall : await withTimeout(groqCall);
            const rppmData = parseRPPMResponse(aiResponse);

            if (!rppmData) {
                return NextResponse.json({ success: false, error: 'Gagal memproses respons AI' }, { status: 500 });
            }

            trackEvent('rppm_generated');
            return NextResponse.json({ success: true, rppm: rppmData });

        } catch (genError) {
            // Check if this is a timeout error (504 Gateway Timeout)
            if (isTimeoutError(genError)) {
                return NextResponse.json({
                    success: false,
                    error: 'GATEWAY_TIMEOUT',
                    message: 'Request timeout. Server terlalu lama merespons.'
                }, { status: 504 });
            }
            // Check if this is a rate limit error from Groq
            if (isRateLimitError(genError) || (genError instanceof Error && genError.message === 'API_RATE_LIMIT')) {
                return NextResponse.json({
                    success: false,
                    error: 'API_RATE_LIMIT',
                    message: 'Batas pemakaian API tercapai. Silakan gunakan API key pribadi.'
                }, { status: 429 });
            }
            throw genError; // Re-throw for general error handling
        }

    } catch (error) {
        console.error('Generate API error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}

/**
 * Format Alokasi Waktu with smart description
 * Input: "3 x 35 menit", jumlahPertemuan: 3
 * Output: "3 × 35 menit (Total 9 JP — 3 pertemuan @35 menit)"
 * 
 * Parses existing input values only - no new fields required.
 */
function formatSmartAlokasi(alokasiWaktu: string, jumlahPertemuan: number): string {
    // Parse alokasiWaktu format: "N x M menit" or "N × M menit"
    const match = alokasiWaktu.match(/(\d+)\s*[x×]\s*(\d+)\s*menit/i);

    if (!match) {
        // If format doesn't match, return original with basic pertemuan info
        return `${alokasiWaktu} (${jumlahPertemuan} pertemuan)`;
    }

    const jpPerPertemuan = parseInt(match[1], 10);  // Jam Pelajaran per pertemuan
    const menitPerJP = parseInt(match[2], 10);      // Menit per JP

    // Calculate total JP
    const totalJP = jpPerPertemuan * jumlahPertemuan;

    // Build smart description
    // Format: "N × M menit (Total X JP — Y pertemuan @M menit)"
    return `${jpPerPertemuan} × ${menitPerJP} menit (Total ${totalJP} JP — ${jumlahPertemuan} pertemuan @${menitPerJP} menit)`;
}

function getDemoHtml(data: any): string {
    // Format tanggal keabsahan
    let tanggalStr: string;
    if (data.identity.tanggalKeabsahan) {
        const tgl = new Date(data.identity.tanggalKeabsahan);
        tanggalStr = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
        tanggalStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const faseDisplay = data.curriculum.fase?.replace('fase_', '').toUpperCase() || 'C';
    const topik = data.curriculum.topikMateri || 'Materi Pembelajaran';
    const mapel = data.curriculum.mapel || 'Mata Pelajaran';
    const sekolah = data.identity.namaSekolah || 'SDN';
    const kepsek = data.identity.namaKepsek || 'Kepala Sekolah';
    const nipKepsek = data.identity.nipKepsek || '.....................';
    const guru = data.identity.namaGuru || 'Guru';
    const nipGuru = data.identity.nipGuru || '.....................';
    const kota = data.identity.kota || 'Kota';
    const kelas = data.curriculum.kelas || '1';
    const jenjang = data.curriculum.jenjang || 'SD';
    const alokasiRaw = data.curriculum.alokasiWaktu || '2 x 35 menit';
    const jumlahPertemuan = data.curriculum.jumlahPertemuan || 1;
    const alokasi = formatSmartAlokasi(alokasiRaw, jumlahPertemuan);
    const model = data.curriculum.model || 'PBL';
    const kondisi = data.curriculum.kondisiAwalMurid || 'Murid memiliki pengetahuan dasar tentang materi ini.';
    const cpText = data.cpText || 'Capaian Pembelajaran sesuai kurikulum.';

    return `
    <div style="font-family: 'Times New Roman', serif; max-width: 900px; margin: auto; padding: 20px; line-height: 1.6; color: black;">
        <h1 style="text-align: center; font-size: 18pt; margin-bottom: 0;">PERENCANAAN PEMBELAJARAN MENDALAM</h1>
        
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
        <p style="text-align: justify;">${kondisi} Murid mengetahui cara mencari informasi menggunakan sumber daring. Murid mengetahui konsep dasar yang akan dipelajari.</p>

        <p><strong>B. Identifikasi Karakter Materi</strong></p>
        <p><strong>Capaian pembelajaran:</strong></p>
        <p style="text-align: justify;">${cpText.substring(0, 500)}${cpText.length > 500 ? '...' : ''}</p>

        <p><strong>C. Dimensi Profil Lulusan:</strong></p>
        <ol>
            <li>Penalaran Kritis</li>
            <li>Kolaborasi</li>
            <li>Komunikasi</li>
        </ol>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">II. DESAIN PEMBELAJARAN</h2>
        
        <p><strong>A. Tujuan Pembelajaran:</strong></p>
        <ol>
            <li>Melalui kegiatan menyimak materi, murid dapat mengidentifikasi konsep-konsep utama ${topik} dengan benar.</li>
            <li>Melalui kegiatan diskusi, murid dapat menyimpulkan permasalahan terkait ${topik} secara mandiri.</li>
            <li>Melalui kegiatan presentasi, murid dapat menyampaikan pendapat terhadap informasi dari materi ${topik} dengan benar.</li>
            <li>Murid dapat menunjukkan kreativitas dan inovasi dalam pemecahan masalah terkait ${topik}.</li>
        </ol>

        <p><strong>B. Kerangka Pembelajaran</strong></p>
        <p><strong>Praktik Pedagogis:</strong></p>
        <ul>
            <li>Model pembelajaran: ${model}</li>
            <li>Metode pembelajaran: menyimak, pencarian informasi digital, diskusi kelompok, presentasi</li>
            <li>Media pembelajaran: PPT, video pembelajaran, LKPD</li>
        </ul>
        <p><strong>Lingkungan Pembelajaran:</strong></p>
        <p style="text-align: justify;">Lingkungan belajar dirancang terbuka, kolaboratif, dan mendukung berpikir kritis. Kelas diatur agar murid dapat berdiskusi dalam kelompok, menggunakan gawai dengan aman dan bertanggung jawab.</p>
        <p><strong>Pemanfaatan Digital:</strong></p>
        <p style="text-align: justify;">Pembelajaran memanfaatkan teknologi digital secara aktif melalui gawai, internet, dan sumber belajar daring untuk mencari informasi aktual.</p>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">III. PENGALAMAN PEMBELAJARAN</h2>
        
        <p><strong>A. Pendahuluan (10 menit) : Berkesadaran</strong></p>
        <ol>
            <li>Guru memberikan salam, menanyakan kabar murid</li>
            <li>Guru dan murid membuka pembelajaran dengan berdoa</li>
            <li>Guru melakukan presensi</li>
            <li>Murid bersama guru membuat kesepakatan belajar</li>
            <li>Guru menyampaikan tujuan pembelajaran</li>
            <li>Guru mengecek kesiapan belajar murid, memberikan motivasi</li>
            <li>Guru memberikan apersepsi dan asesmen awal berupa pertanyaan pemantik:
                <ul>
                    <li>Menurutmu, apa yang kamu ketahui tentang ${topik}?</li>
                    <li>Dari mana saja kamu biasanya mendapatkan informasi tentang hal ini?</li>
                    <li>Bagaimana caramu memahami konsep yang baru kamu pelajari?</li>
                </ul>
            </li>
        </ol>

        <p><strong>B. Kegiatan Inti (50 menit)</strong></p>
        <p><strong>1) Orientasi terhadap masalah : memahami, berkesadaran</strong></p>
        <ul>
            <li>Guru memberikan penjelasan tentang ${topik} melalui PPT</li>
            <li>Guru menayangkan video pembelajaran terkait materi</li>
            <li>Guru menanyakan: "Apa yang membuat materi ini penting untuk kita pahami?"</li>
        </ul>
        <p><strong>2) Mengorganisasi murid untuk belajar : mengaplikasi, bermakna</strong></p>
        <ul>
            <li>Murid dibagi ke dalam kelompok kecil yang terdiri dari 4-5 orang</li>
            <li>Murid menyimak dan menandai konsep-konsep penting dari materi</li>
            <li>Tiap kelompok diberi tugas untuk mengeksplorasi aspek tertentu dari ${topik}</li>
        </ul>
        <p><strong>3) Membimbing penyelidikan : mengaplikasi, bermakna, menggembirakan</strong></p>
        <ul>
            <li>Murid mendiskusikan hasil pencarian informasi dalam kelompok</li>
            <li>Murid membuat kesimpulan berdasarkan pemahaman bersama</li>
            <li>Guru memberikan pertanyaan pemantik: "Apa pesan utama dari materi ini?"</li>
            <li>Murid menyajikan dalam bentuk peta pikiran</li>
        </ul>
        <p><strong>4) Mengembangkan dan menyajikan hasil karya : mengaplikasi, menggembirakan</strong></p>
        <ul>
            <li>Tiap kelompok mempresentasikan hasil pemahaman dan pendapat mereka</li>
            <li>Murid lain memberi tanggapan dengan sopan</li>
        </ul>
        <p><strong>5) Menganalisis dan mengevaluasi : merefleksi, berkesadaran</strong></p>
        <ul>
            <li>Murid bersama kelompoknya menganalisis kembali hasil yang telah dibuat</li>
            <li>Murid mengevaluasi cara mereka bekerja sama</li>
            <li>Murid menuliskan strategi apa yang paling membantu memahami materi</li>
        </ul>

        <p><strong>C. Penutup (10 menit)</strong></p>
        <ol>
            <li>Guru bersama murid menyimpulkan pembelajaran hari itu</li>
            <li>Guru memberi penguatan dan umpan balik positif</li>
            <li>Refleksi pribadi murid: Hal apa yang paling kamu pelajari hari ini?</li>
            <li>Guru memberikan tindak lanjut (tugas rumah)</li>
        </ol>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">IV. ASESMEN DAN TINDAK LANJUT</h2>
        <ul>
            <li><strong>Asesmen Formatif (As Learning):</strong> Tanya jawab singkat tentang pemahaman awal</li>
            <li><strong>Asesmen Formatif (For Learning):</strong> Lembar observasi, Rubrik penilaian, Lembar penilaian diri</li>
            <li><strong>Asesmen Sumatif (Of Learning):</strong> Dilakukan di akhir capaian pembelajaran</li>
        </ul>

        <h2 style="font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 5px;">V. RUBRIK PENILAIAN</h2>
        
        <p><strong>A. Lembar Penilaian Ceklist Dimensi Profil Lulusan</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px;">No</th>
                <th style="padding: 8px;">Nama Murid</th>
                <th style="padding: 8px;">Penalaran Kritis</th>
                <th style="padding: 8px;">Kolaborasi</th>
                <th style="padding: 8px;">Komunikasi</th>
            </tr>
            <tr><td>1</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3</td><td></td><td></td><td></td><td></td></tr>
        </table>

        <p><strong>B. Penilaian Kinerja Murid (Skala SOLO)</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 20px;">
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px;">No</th>
                <th style="padding: 8px;">Aspek yang Dinilai</th>
                <th style="padding: 8px;">Indikator Perilaku</th>
                <th style="padding: 8px;">Level SOLO</th>
            </tr>
            <tr>
                <td style="padding: 8px;">1</td>
                <td style="padding: 8px;">Pemahaman Konsep</td>
                <td style="padding: 8px;">Mampu menjelaskan konsep ${topik} secara utuh</td>
                <td style="padding: 8px;">Prestructural → Extended Abstract</td>
            </tr>
            <tr>
                <td style="padding: 8px;">2</td>
                <td style="padding: 8px;">Kolaborasi Kelompok</td>
                <td style="padding: 8px;">Aktif bekerja sama, menghargai pendapat teman</td>
                <td style="padding: 8px;">Prestructural → Extended Abstract</td>
            </tr>
            <tr>
                <td style="padding: 8px;">3</td>
                <td style="padding: 8px;">Komunikasi</td>
                <td style="padding: 8px;">Mampu berbicara dengan sopan dan jelas</td>
                <td style="padding: 8px;">Prestructural → Extended Abstract</td>
            </tr>
        </table>

        <p><strong>C. Kriteria Penskoran</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 20px;">
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px;">Level</th>
                <th style="padding: 8px;">Deskripsi Umum</th>
                <th style="padding: 8px;">Skor</th>
                <th style="padding: 8px;">Keterangan</th>
            </tr>
            <tr><td style="padding: 8px;">Prestructural</td><td style="padding: 8px;">Belum memahami tugas dan konteks pembelajaran</td><td style="padding: 8px;">1</td><td style="padding: 8px;">Perlu bimbingan intensif</td></tr>
            <tr><td style="padding: 8px;">Unistructural</td><td style="padding: 8px;">Memahami sebagian kecil tugas atau konsep</td><td style="padding: 8px;">2</td><td style="padding: 8px;">Pemahaman dasar</td></tr>
            <tr><td style="padding: 8px;">Multistructural</td><td style="padding: 8px;">Memahami beberapa bagian konsep tanpa menghubungkannya</td><td style="padding: 8px;">3</td><td style="padding: 8px;">Pemahaman berkembang</td></tr>
            <tr><td style="padding: 8px;">Relational</td><td style="padding: 8px;">Mampu mengaitkan ide pokok, memahami konteks dengan tepat</td><td style="padding: 8px;">4</td><td style="padding: 8px;">Pemahaman mendalam</td></tr>
            <tr><td style="padding: 8px;">Extended Abstract</td><td style="padding: 8px;">Mampu menganalisis dan mengaitkan konsep dengan konteks nyata</td><td style="padding: 8px;">5</td><td style="padding: 8px;">Pemahaman luar biasa</td></tr>
        </table>

        <p><strong>Rekap Nilai Murid</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
            <tr style="background-color: #fef3c7;">
                <th style="padding: 8px;">No</th>
                <th style="padding: 8px;">Nama Murid</th>
                <th style="padding: 8px;">A1</th>
                <th style="padding: 8px;">A2</th>
                <th style="padding: 8px;">A3</th>
                <th style="padding: 8px;">A4</th>
                <th style="padding: 8px;">A5</th>
                <th style="padding: 8px;">A6</th>
                <th style="padding: 8px;">A7</th>
                <th style="padding: 8px;">A8</th>
                <th style="padding: 8px;">Nilai Akhir</th>
                <th style="padding: 8px;">Ket</th>
            </tr>
            <tr><td>1</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>4</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>5</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        </table>
        <p><em>Keterangan: A1-A8 = Aspek Penilaian 1-8</em></p>

        <p><strong>Interpretasi Nilai Akhir</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
            <tr style="background-color: #dcfce7;">
                <th style="padding: 8px;">Rentang Nilai</th>
                <th style="padding: 8px;">Predikat</th>
                <th style="padding: 8px;">Deskripsi Umum</th>
            </tr>
            <tr><td>90 - 100</td><td><strong>SB (Sangat Baik)</strong></td><td style="text-align: left; padding: 8px;">Menguasai seluruh kompetensi dengan sangat baik</td></tr>
            <tr><td>75 - 89</td><td><strong>B (Baik)</strong></td><td style="text-align: left; padding: 8px;">Menguasai kompetensi dengan baik</td></tr>
            <tr><td>60 - 74</td><td><strong>C (Cukup)</strong></td><td style="text-align: left; padding: 8px;">Memahami beberapa aspek kompetensi</td></tr>
            <tr><td>&lt; 60</td><td><strong>PB (Perlu Bimbingan)</strong></td><td style="text-align: left; padding: 8px;">Memerlukan bimbingan tambahan</td></tr>
        </table>

        <p><strong>D. Evaluasi dan Refleksi Diri Murid</strong></p>
        <p>Petunjuk: Berilah tanda centang (✓) sesuai kondisimu (Skala 1-4: 1=belum, 4=sudah sangat)</p>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
            <tr style="background-color: #f0fdf4;">
                <th style="padding: 8px;">No</th>
                <th style="padding: 8px;">Pertanyaan Refleksi</th>
                <th style="padding: 8px;">1</th>
                <th style="padding: 8px;">2</th>
                <th style="padding: 8px;">3</th>
                <th style="padding: 8px;">4</th>
            </tr>
            <tr><td>1</td><td style="text-align: left; padding: 8px;">Saya memahami tujuan pembelajaran hari ini.</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
            <tr><td>2</td><td style="text-align: left; padding: 8px;">Saya aktif berpartisipasi dalam diskusi kelompok.</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
            <tr><td>3</td><td style="text-align: left; padding: 8px;">Saya dapat menjelaskan konsep materi kepada teman.</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
            <tr><td>4</td><td style="text-align: left; padding: 8px;">Saya mampu menghubungkan materi dengan kehidupan sehari-hari.</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
            <tr><td>5</td><td style="text-align: left; padding: 8px;">Saya merasa tertantang dan bersemangat dalam pembelajaran.</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
        </table>

        <p><strong>E. Catatan Guru</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #fef3c7;"><th style="padding: 8px;">Catatan untuk Tindak Lanjut</th></tr>
            <tr><td style="padding: 16px; min-height: 80px;"></td></tr>
        </table>

        <p><strong>F. Lembar Kerja Murid (LKM)</strong></p>
        <p>Petunjuk Pengerjaan: Kerjakan soal berikut dengan teliti!</p>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #e0f2fe;">
                <th style="padding: 8px;">Kegiatan/Soal</th>
                <th style="padding: 8px;">Ruang Jawaban</th>
            </tr>
            <tr><td style="padding: 8px;">1. Jelaskan pengertian ${topik} dengan bahasamu sendiri!</td><td style="padding: 8px; min-height: 60px;"></td></tr>
            <tr><td style="padding: 8px;">2. Sebutkan 3 contoh penerapan ${topik} dalam kehidupan sehari-hari!</td><td style="padding: 8px; min-height: 60px;"></td></tr>
            <tr><td style="padding: 8px;">3. Buatlah diagram/peta pikiran tentang ${topik}!</td><td style="padding: 8px; min-height: 80px;"></td></tr>
        </table>

        <p><strong>G. Sumber Belajar Tambahan</strong></p>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #fce7f3;">
                <th style="padding: 8px;">Jenis</th>
                <th style="padding: 8px;">Judul/Deskripsi</th>
                <th style="padding: 8px;">Link/Sumber</th>
            </tr>
            <tr><td style="padding: 8px;">Video YouTube</td><td style="padding: 8px;">Video pembelajaran ${topik}</td><td style="padding: 8px;">https://youtube.com/...</td></tr>
            <tr><td style="padding: 8px;">Template Canva</td><td style="padding: 8px;">Template presentasi ${mapel}</td><td style="padding: 8px;">https://canva.com/...</td></tr>
            <tr><td style="padding: 8px;">Artikel Web</td><td style="padding: 8px;">Artikel pembelajaran ${topik}</td><td style="padding: 8px;">https://...</td></tr>
            <tr><td style="padding: 8px;">Buku Referensi</td><td style="padding: 8px;">Buku ${mapel} Kelas ${kelas}</td><td style="padding: 8px;">Kemendikbud</td></tr>
        </table>

        <div style="margin-top: 80px; width: 100%;">
            <table style="width: 100%; border: none;">
                <tr>
                    <td style="width: 50%; text-align: center; vertical-align: top;">
                        Mengetahui,<br>Kepala Sekolah<br><br><br><br>
                        <strong>${kepsek}</strong><br>
                        NIP. ${nipKepsek}
                    </td>
                    <td style="width: 50%; text-align: center; vertical-align: top;">
                        ${kota}, ${tanggalStr}<br>
                        Guru Mata Pelajaran<br><br><br><br>
                        <strong>${guru}</strong><br>
                        NIP. ${nipGuru}
                    </td>
                </tr>
            </table>
        </div>
    </div>
    `;
}
