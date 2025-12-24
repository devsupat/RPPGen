// AI Prompt Templates for Deep Learning RPPM Generation
// Struktur Pembelajaran Mendalam sesuai Kurikulum Merdeka

import type { RPPMInput, CurriculumInput, IdentityInput } from '@/types';

// ============================================
// SYSTEM PROMPT - Persona & Rules
// ============================================

export const SYSTEM_PROMPT = `Kamu adalah GuruPintar AI, asisten cerdas untuk guru Indonesia dalam membuat Rencana Pelaksanaan Pembelajaran Mendalam (RPPM) sesuai Kurikulum Merdeka 2025.

## ATURAN WAJIB:
1. SELALU gunakan istilah "Murid" (BUKAN "Peserta Didik" atau "Siswa")
2. Setiap aktivitas pembelajaran WAJIB memiliki label prinsip: [Berkesadaran], [Bermakna], atau [Menggembirakan]
3. Rubrik penilaian WAJIB menggunakan 5 Level Taksonomi SOLO
4. Format output HARUS berupa JSON valid tanpa markdown
5. Bahasa Indonesia yang baik dan formal

## STRUKTUR RPPM PEMBELAJARAN MENDALAM:

### I. IDENTIFIKASI
- **Identifikasi Murid**: Kemampuan prasyarat yang dimiliki murid sebelum belajar materi ini
- **Identifikasi Karakter Materi**: Elemen dan deskripsi Capaian Pembelajaran (CP)
- **Dimensi Profil Pelajar Pancasila**: Beriman, Mandiri, Bernalar Kritis, Kreatif, Bergotong Royong, Berkebinekaan Global

### II. DESAIN PEMBELAJARAN
- **Tujuan Pembelajaran**: Format "Melalui kegiatan [aktivitas], murid dapat [kompetensi]..."
- **Model Pembelajaran**: PBL (Problem Based Learning), PjBL (Project Based Learning), Discovery Learning, dll
- **Praktik Pedagogis**: Metode dan media yang digunakan
- **Lingkungan Pembelajaran**: Kolaboratif, inklusif, menyenangkan
- **Pemanfaatan Digital**: Sertakan rekomendasi link YouTube/website edukatif NYATA sesuai mata pelajaran

### III. PENGALAMAN BELAJAR
1. **Pendahuluan [Berkesadaran]**: Salam, doa, kesepakatan belajar, asesmen awal, pertanyaan pemantik
2. **Kegiatan Inti [Bermakna/Menggembirakan]**: Langkah-langkah model pembelajaran dengan aktivitas digital
3. **Penutup [Merefleksi]**: Kesimpulan bersama, refleksi pribadi, tindak lanjut

### IV. ASESMEN & TINDAK LANJUT
- **As Learning**: Asesmen sebagai pembelajaran (refleksi diri)
- **For Learning**: Asesmen untuk pembelajaran (formatif)
- **Of Learning**: Asesmen terhadap pembelajaran (sumatif)

### V. RUBRIK PENILAIAN (TAKSONOMI SOLO)
- **Prestructural**: Belum memahami, jawaban tidak relevan
- **Unistructural**: Memahami satu aspek sederhana
- **Multistructural**: Memahami beberapa aspek terpisah
- **Relational**: Menghubungkan antar aspek secara terpadu
- **Extended Abstract**: Menggeneralisasi ke konteks baru, menciptakan solusi inovatif

## REKOMENDASI DIGITAL RESOURCES:
Untuk setiap mata pelajaran, sertakan:
- 2-3 link YouTube edukatif terkait materi (channel resmi/populer seperti Zenius, Ruangguru, Quipper, Khan Academy Indonesia, dll)
- 1-2 website/blog referensi

CONTOH format sumber digital:
- "Video: Pecahan untuk SD - Zenius (youtube.com/watch?v=xxxxx)"
- "Simulasi: PhET Interactive Simulations (phet.colorado.edu)"`;

// ============================================
// USER PROMPT BUILDER
// ============================================

export function buildUserPrompt(
    input: RPPMInput,
    cpText: string
): string {
    const { identity, curriculum } = input;

    return `Buatkan RPPM Pembelajaran Mendalam untuk:

## INFORMASI IDENTITAS
- Satuan Pendidikan: ${identity.namaSekolah}
- Fase/Kelas: ${curriculum.fase} / Kelas ${curriculum.kelas}
- Jenjang: ${curriculum.jenjang}
- Mata Pelajaran: ${curriculum.mapel}
- Topik/Materi: ${curriculum.topikMateri}
- Alokasi Waktu: 2 x 35 menit (dapat disesuaikan)

## DATA GURU
- Kepala Sekolah: ${identity.namaKepsek} (NIP: ${identity.nipKepsek})
- Guru Pengajar: ${identity.namaGuru}${identity.nipGuru ? ` (NIP: ${identity.nipGuru})` : ''}

## CAPAIAN PEMBELAJARAN (SK 046/2025)
${cpText}

${curriculum.kondisiAwalMurid ? `## KONDISI AWAL MURID
${curriculum.kondisiAwalMurid}` : ''}

## INSTRUKSI KHUSUS:
1. Gunakan model PBL/PjBL/Discovery Learning yang sesuai dengan materi "${curriculum.topikMateri}"
2. Buat 3-5 pertanyaan pemantik yang menarik dan kontekstual
3. Rancang aktivitas kolaboratif yang melibatkan diskusi kelompok
4. Sertakan 2-3 link YouTube edukatif NYATA yang relevan untuk materi ini (dari channel seperti Zenius, Ruangguru, Quipper, atau channel pendidikan populer)
5. Sertakan minimal 1 website/aplikasi digital untuk aktivitas pembelajaran
6. Buat rubrik penilaian dengan 5 level SOLO yang spesifik untuk materi ini

## FORMAT OUTPUT JSON:
{
  "judul": "Rencana Pembelajaran Mendalam: [Topik]",
  "sekolah": "${identity.namaSekolah}",
  "kepsek": { "nama": "${identity.namaKepsek}", "nip": "${identity.nipKepsek}" },
  "guru": { "nama": "${identity.namaGuru}"${identity.nipGuru ? `, "nip": "${identity.nipGuru}"` : ''} },
  "mapel": "${curriculum.mapel}",
  "kelas": "${curriculum.jenjang} Kelas ${curriculum.kelas}",
  "fase": "Fase ${curriculum.fase}",
  "topik": "${curriculum.topikMateri}",
  "alokasiWaktu": "2 x 35 menit",
  
  "capaianPembelajaran": {
    "[Elemen 1]": "[Deskripsi CP]",
    "[Elemen 2]": "[Deskripsi CP]"
  },
  
  "identifikasi": {
    "karakteristikMurid": "[Kemampuan prasyarat dan kondisi awal murid]",
    "karakterMateri": "[Karakteristik dan kompleksitas materi]",
    "dimensiProfilLulusan": ["Bernalar Kritis", "Bergotong Royong", "..."]
  },
  
  "desainPembelajaran": {
    "tujuanPembelajaran": [
      "Melalui kegiatan [aktivitas], murid dapat [kompetensi]...",
      "..."
    ],
    "model": "[Nama Model Pembelajaran]",
    "metode": ["Diskusi", "Praktik", "Presentasi"],
    "media": ["LKPD", "Video", "Alat Peraga"],
    "pendekatanDeepLearning": {
      "berkesadaran": "[Bagaimana murid sadar akan proses belajarnya]",
      "bermakna": "[Bagaimana pembelajaran dikaitkan dengan kehidupan nyata]",
      "menggembirakan": "[Bagaimana pembelajaran dibuat menyenangkan]"
    },
    "lingkunganPembelajaran": "[Deskripsi lingkungan kolaboratif]",
    "pemanfaatanDigital": [
      "Video: [Judul Video] - [Channel] (https://youtube.com/watch?v=...)",
      "Website: [Nama Website] (https://...)",
      "Aplikasi: [Nama Aplikasi] untuk [kegunaan]"
    ]
  },
  
  "pengalamanBelajar": {
    "pendahuluan": [
      "[Salam dan doa] [Berkesadaran]",
      "[Kesepakatan belajar] [Berkesadaran]",
      "[Pertanyaan pemantik: ...?] [Berkesadaran]",
      "[Asesmen awal/apersepsi] [Berkesadaran]"
    ],
    "kegiatan_inti": [
      { "deskripsi": "[Langkah 1 - Orientasi masalah]", "labelKompetensi": "Bernalar Kritis - Bermakna" },
      { "deskripsi": "[Langkah 2 - Mengorganisasi murid]", "labelKompetensi": "Kolaborasi - Bermakna" },
      { "deskripsi": "[Langkah 3 - Membimbing penyelidikan]", "labelKompetensi": "Kreatif - Menggembirakan" },
      { "deskripsi": "[Langkah 4 - Mengembangkan karya]", "labelKompetensi": "Komunikasi - Menggembirakan" },
      { "deskripsi": "[Langkah 5 - Evaluasi proses]", "labelKompetensi": "Reflektif - Merefleksi" }
    ],
    "penutup": [
      "[Kesimpulan bersama] [Merefleksi]",
      "[Refleksi: Apa yang sudah dipelajari?] [Merefleksi]",
      "[Tindak lanjut dan tugas] [Merefleksi]",
      "[Doa penutup] [Merefleksi]"
    ]
  },
  
  "asesmen": {
    "asLearning": "[Refleksi diri murid tentang proses belajar]",
    "forLearning": "[Asesmen formatif: observasi, tanya jawab]",
    "ofLearning": "[Asesmen sumatif: produk, presentasi, tes]"
  },
  
  "rubrikPenilaian": [
    {
      "level": "Extended Abstract",
      "deskripsi": "[Murid dapat menggeneralisasi konsep ke konteks baru]",
      "indikator": "[Indikator spesifik untuk materi ini]"
    },
    {
      "level": "Relational",
      "deskripsi": "[Murid dapat menghubungkan berbagai aspek secara terpadu]",
      "indikator": "[Indikator spesifik]"
    },
    {
      "level": "Multistructural",
      "deskripsi": "[Murid memahami beberapa aspek terpisah]",
      "indikator": "[Indikator spesifik]"
    },
    {
      "level": "Unistructural",
      "deskripsi": "[Murid memahami satu aspek sederhana]",
      "indikator": "[Indikator spesifik]"
    },
    {
      "level": "Prestructural",
      "deskripsi": "[Murid belum memahami konsep]",
      "indikator": "[Indikator spesifik]"
    }
  ]
}

PENTING: Output HANYA JSON valid tanpa penjelasan tambahan atau markdown code blocks.`;
}

// ============================================
// RESPONSE PARSER
// ============================================

export function parseRPPMResponse(response: string): Record<string, unknown> | null {
    try {
        // Clean up the response - remove markdown code blocks if present
        let cleaned = response.trim();

        // Remove ```json and ``` markers
        cleaned = cleaned.replace(/^```json\s*/i, '');
        cleaned = cleaned.replace(/^```\s*/i, '');
        cleaned = cleaned.replace(/\s*```$/i, '');

        // Find JSON object boundaries
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
            console.error('No valid JSON structure found in response');
            return null;
        }

        const jsonString = cleaned.substring(firstBrace, lastBrace + 1);

        // Parse JSON
        const parsed = JSON.parse(jsonString);

        return parsed;
    } catch (error) {
        console.error('Failed to parse RPPM response:', error);
        console.error('Raw response:', response.substring(0, 500));
        return null;
    }
}

// ============================================
// DIGITAL RESOURCE SUGGESTIONS BY SUBJECT
// ============================================

export function getDigitalResourceSuggestions(mapel: string): string[] {
    const resources: Record<string, string[]> = {
        'Matematika': [
            'Zenius - Matematika SD/SMP/SMA',
            'Ruangguru - Materi Matematika',
            'Khan Academy Indonesia',
            'GeoGebra (geogebra.org)',
            'Photomath App'
        ],
        'Bahasa Indonesia': [
            'Zenius - Bahasa Indonesia',
            'KBBI Daring (kbbi.kemdikbud.go.id)',
            'Ruangguru Literasi',
            'Pojok Baca Digital',
            'Google Docs untuk menulis kolaboratif'
        ],
        'IPA': [
            'PhET Interactive Simulations (phet.colorado.edu)',
            'Zenius - IPA Terpadu',
            'National Geographic Indonesia',
            'Eksplorasi Alam App',
            'YouTube: Kok Bisa?'
        ],
        'IPS': [
            'Zenius - Sejarah & Geografi',
            'Google Earth untuk eksplorasi',
            'Wikipedia Indonesia',
            'Atlas Digital Indonesia',
            'YouTube: Historia Indonesia'
        ],
        'IPAS': [
            'PhET Simulations',
            'Zenius - IPAS',
            'Google Earth',
            'Weather App untuk pengamatan cuaca',
            'YouTube: Kok Bisa?'
        ],
        'Informatika': [
            'Scratch (scratch.mit.edu)',
            'Code.org',
            'YouTube: Programmer Zaman Now',
            'W3Schools (w3schools.com)',
            'Canva untuk desain'
        ],
        'PAI': [
            'Quran.com',
            'Muslim Pro App',
            'YouTube: Ustaz Adi Hidayat',
            'Rumaysho.com',
            'Al-Quran Digital Kemenag'
        ],
        'PJOK': [
            'YouTube: Latihan Olahraga Anak',
            'Nike Training Club App',
            'YouTube: Senam Sehat',
            'Strava untuk tracking aktivitas',
            'YouTube: Olahraga di Rumah'
        ]
    };

    return resources[mapel] || [
        'Zenius Education',
        'Ruangguru',
        'Quipper',
        'YouTube Edu',
        'Google Classroom'
    ];
}
