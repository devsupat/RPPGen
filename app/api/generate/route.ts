// API Route: Generate RPPM
// POST /api/generate - Generate RICH CONTENT RPPM using Groq AI
// Standard: Kemendikdasmen SK 046/2025

import { NextRequest, NextResponse } from 'next/server';
import { generateCompletion, isGroqConfigured } from '@/lib/groq';
import { SYSTEM_PROMPT, buildUserPrompt, parseRPPMResponse } from '@/lib/promptTemplates';
import { getCPTextForPrompt, getPhaseByClass } from '@/data/cp_registry';
import { trackEvent } from '@/lib/metrics';
import type { RPPMInput } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = body as RPPMInput;

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

        if (!isGroqConfigured()) {
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
        const aiResponse = await generateCompletion(SYSTEM_PROMPT, userPrompt);
        const rppmData = parseRPPMResponse(aiResponse);

        if (!rppmData) {
            return NextResponse.json({ success: false, error: 'Gagal memproses respons AI' }, { status: 500 });
        }

        trackEvent('rppm_generated');
        return NextResponse.json({ success: true, rppm: rppmData });

    } catch (error) {
        console.error('Generate API error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
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
    const alokasi = data.curriculum.alokasiWaktu || '2 x 35 menit';
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
                <th style="padding: 8px;">Bernalar Kritis</th>
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
            </tr>
            <tr><td style="padding: 8px;">Prestructural</td><td style="padding: 8px;">Belum memahami tugas dan konteks pembelajaran</td><td style="padding: 8px;">1</td></tr>
            <tr><td style="padding: 8px;">Unistructural</td><td style="padding: 8px;">Memahami sebagian kecil tugas atau konsep</td><td style="padding: 8px;">2</td></tr>
            <tr><td style="padding: 8px;">Multistructural</td><td style="padding: 8px;">Memahami beberapa bagian konsep tanpa menghubungkannya</td><td style="padding: 8px;">3</td></tr>
            <tr><td style="padding: 8px;">Relational</td><td style="padding: 8px;">Mampu mengaitkan ide pokok, memahami konteks dengan tepat</td><td style="padding: 8px;">4</td></tr>
            <tr><td style="padding: 8px;">Extended Abstract</td><td style="padding: 8px;">Mampu menganalisis dan mengaitkan konsep dengan konteks nyata</td><td style="padding: 8px;">5</td></tr>
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
