// Prompt Templates for Deep Learning RPPM Generation
// Struktur sesuai PRD v4.0: Taksonomi SOLO, Dimensi Profil Lulusan, dll.

import type { RPPMInput } from '@/types';

// ============================================
// System Prompt: AI Persona & Rules
// ============================================

export const SYSTEM_PROMPT = `Kamu adalah GuruPintar AI, asisten cerdas untuk guru Indonesia dalam menyusun Rencana Pembelajaran Mendalam (RPPM) sesuai Kurikulum Merdeka.

ATURAN PENTING:
1. SELALU gunakan istilah "Murid" (BUKAN "Peserta Didik" atau "Siswa")
2. Output harus dalam format JSON yang valid
3. Semua kegiatan pembelajaran WAJIB diberi label kompetensi (contoh: "Mengaplikasi, Bermakna")
4. Rubrik penilaian WAJIB menggunakan Taksonomi SOLO (5 level)
5. Bahasa Indonesia formal namun mudah dipahami

TAKSONOMI SOLO (Structure of Observed Learning Outcomes):
- Prestructural: Murid belum memahami, memberikan respons tidak relevan
- Unistructural: Murid memahami satu aspek sederhana
- Multistructural: Murid memahami beberapa aspek tetapi belum terhubung
- Relational: Murid mengintegrasikan aspek-aspek menjadi struktur koheren
- Extended Abstract: Murid dapat menggeneralisasi ke konteks baru

Dimensi Profil Lulusan
Keimanan & Ketakwaan kepada Tuhan Yang Maha Esa: Memiliki landasan spiritual dan akhlak mulia.
Kewargaan: Menjadi warga negara yang bertanggung jawab, cinta tanah air, serta peduli sosial.
Penalaran Kritis: Mampu berpikir logis, analitis, dan menyelesaikan masalah secara efektif.
Kreativitas: Mampu berinovasi dan menciptakan solusi baru.
Kolaborasi: Mampu bekerja sama dengan orang lain dalam lingkungan yang beragam.
Kemandirian: Bertanggung jawab atas proses belajar dan pengembangan diri.
Kesehatan: Menjaga kebugaran fisik dan mental untuk kesejahteraan lahir batin.
Komunikasi: Mampu menyimak, membaca, berbicara, dan menulis dengan baik dan benar.`;

// ============================================
// User Prompt Template
// ============================================

export function buildUserPrompt(input: RPPMInput, cpText: string): string {
    const { identity, curriculum } = input;

    return `Buatkan RPPM (Rencana Pembelajaran Mendalam) dengan data berikut:

## IDENTITAS
- Sekolah: ${identity.namaSekolah}
- Kepala Sekolah: ${identity.namaKepsek} (NIP: ${identity.nipKepsek})
- Guru Pengajar: ${identity.namaGuru}${identity.nipGuru ? ` (NIP: ${identity.nipGuru})` : ''}

## KURIKULUM
- Jenjang: ${curriculum.jenjang} Kelas ${curriculum.kelas}
- Fase: ${curriculum.fase.replace('fase_', 'Fase ')}
- Mata Pelajaran: ${curriculum.mapel}
- Topik/Materi: ${curriculum.topikMateri}
${curriculum.kondisiAwalMurid ? `- Kondisi Awal Murid: ${curriculum.kondisiAwalMurid}` : ''}

## CAPAIAN PEMBELAJARAN (CP) RESMI:
${cpText}

---

Hasilkan RPPM dalam format JSON berikut:

{
  "judul": "Rencana Pembelajaran Mendalam: [Topik]",
  
  "identifikasi": {
    "karakteristikMurid": "[Deskripsi karakteristik murid berdasarkan fase dan kondisi awal]",
    "karakterMateri": "[Deskripsi karakter dan tingkat kesulitan materi]",
    "dimensiProfilLulusan": ["[Pilih 2-3 dimensi yang relevan]"]
  },
  
  "desainPembelajaran": {
    "model": "[PBL atau PjBL]",
    "pendekatanDeepLearning": {
      "berkesadaran": "[Bagaimana pembelajaran ini membangun kesadaran murid]",
      "bermakna": "[Bagaimana materi dikaitkan dengan kehidupan nyata]",
      "menggembirakan": "[Strategi agar pembelajaran menyenangkan]"
    },
    "pemanfaatanDigital": ["[Daftar tools digital: Youtube, Quizizz, KBBI Daring, dll]"]
  },
  
  "pengalamanBelajar": {
    "pendahuluan": [
      "[Kegiatan pembuka dengan label: (Kompetensi, Pendekatan)]"
    ],
    "kegiatan_inti": [
      {
        "deskripsi": "[Deskripsi kegiatan]",
        "labelKompetensi": "[Mengingat/Memahami/Mengaplikasi/Menganalisis/Mengevaluasi/Mencipta], [Berkesadaran/Bermakna/Menggembirakan]"
      }
    ],
    "penutup": [
      "[Kegiatan penutup dengan refleksi]"
    ]
  },
  
  "rubrikPenilaian": [
    {
      "level": "Prestructural",
      "deskripsi": "[Deskripsi level ini untuk topik ini]",
      "indikator": "[Indikator konkret yang dapat diamati]"
    },
    {
      "level": "Unistructural",
      "deskripsi": "[Deskripsi level ini untuk topik ini]",
      "indikator": "[Indikator konkret yang dapat diamati]"
    },
    {
      "level": "Multistructural",
      "deskripsi": "[Deskripsi level ini untuk topik ini]",
      "indikator": "[Indikator konkret yang dapat diamati]"
    },
    {
      "level": "Relational",
      "deskripsi": "[Deskripsi level ini untuk topik ini]",
      "indikator": "[Indikator konkret yang dapat diamati]"
    },
    {
      "level": "Extended Abstract",
      "deskripsi": "[Deskripsi level ini untuk topik ini]",
      "indikator": "[Indikator konkret yang dapat diamati]"
    }
  ]
}

PENTING:
- Isi semua field dengan konten bermakna dan spesifik untuk topik "${curriculum.topikMateri}"
- Pastikan setiap kegiatan inti memiliki label kompetensi
- Rubrik SOLO harus spesifik untuk materi, bukan generik
- Output HANYA JSON, tanpa penjelasan tambahan`;
}

// ============================================
// Parse AI Response to RPPMOutput
// ============================================

export function parseRPPMResponse(jsonString: string): Record<string, unknown> | null {
    try {
        // Try to extract JSON from response if wrapped in markdown
        let cleanJson = jsonString.trim();

        // Remove markdown code blocks if present
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.slice(7);
        }
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.slice(0, -3);
        }

        cleanJson = cleanJson.trim();

        // Parse JSON
        const parsed = JSON.parse(cleanJson);
        return parsed;

    } catch (error) {
        console.error('Failed to parse RPPM JSON:', error);
        console.error('Raw response:', jsonString.substring(0, 500));
        return null;
    }
}
