
# Project Title

📄 Product Requirements Document (PRD)
Nama Proyek: GuruPintar AI (Deep Learning Edition) Versi: 4.0 (Final Production Ready) Target Pengguna: Guru SD, SMP, SMA (Semua tingkat literasi digital).

1. Latar Belakang & Filosofi
Membangun generator "Rencana Pembelajaran Mendalam" (RPPM) yang cerdas, patuh pada aturan kurikulum terbaru (SK 046/2025), dan melindungi privasi guru.

Privacy First: Tidak ada data RPP yang disimpan di database server. Generate -> Download -> Forget.

Deep Learning: Output bukan sekadar administratif, tapi memuat pedagogi mendalam (Taksonomi SOLO, Diferensiasi, Kompetensi Bermakna).

Strict Compliance: Menggunakan database CP statis hasil ekstraksi hukum, bukan halusinasi AI.

2. Spesifikasi Teknis (Tech Stack)
Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI.

AI Logic: Groq SDK (Model: llama3-70b-8192 atau mixtral-8x7b untuk kecepatan & akurasi Bahasa Indonesia).
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": ""
           }
         ],
         "model": "llama-3.3-70b-versatile",
         "temperature": 1,
         "max_completion_tokens": 1024,
         "top_p": 1,
         "stop": null
       }'
  
Authentication & Session: Google Sheets API (sebagai database user ringan & device lock).

Export Engine: docx (untuk Word) dan jspdf (untuk PDF).

3. Fitur Utama & Alur Kerja
A. Sistem Login "Satu Perangkat" (Anti-Sharing)
Input: User memasukkan "Kode Akses" unik.

Validasi: Sistem mengecek Google Sheet.

Device Lock Logic:

Jika kode valid & kolom Device_Hash kosong -> Izinkan masuk & kunci Device_Hash dengan fingerprint browser user saat ini.

Jika kode valid tapi Device_Hash berbeda dengan browser saat ini -> BLOKIR AKSES ("Akun sedang digunakan di perangkat lain").

Reset akses hanya bisa dilakukan admin via Google Sheet.

B. Input Data (Gaptek-Friendly Wizard)
Formulir dibagi menjadi tahapan (Step-by-Step) agar tidak menakutkan:

Tahap 1 - Identitas:

Nama Sekolah & Kepsek (NIP Wajib).

Nama Guru (NIP Opsional - beri label "Kosongkan jika belum ada").

Tahap 2 - Kurikulum:

Pilih Jenjang/Kelas (Mapping otomatis ke Fase A-F).

Pilih Mapel (Dropdown dinamis mengambil data dari cp_2025.ts).

Input Topik Materi.

Input Kondisi Awal Murid (Opsional, untuk diagnostik).

C. Curriculum Engine (The Brain)
Sistem membaca file data/cp_registry/cp_2025.ts.

Berdasarkan input Fase & Mapel, sistem mengambil teks Capaian Pembelajaran (CP) asli.

Constraint: Jika di CP tertulis "Peserta Didik", sistem menginstruksikan AI untuk mengubahnya menjadi "Murid".

D. AI Generation (Deep Learning Structure)
Prompt harus menghasilkan output dengan struktur RPPM berikut:

Identifikasi: Identifikasi Murid, Karakter Materi, & Dimensi Profil Lulusan.

Desain Pembelajaran:

Model (PBL/PjBL).

Pendekatan Deep Learning (Berkesadaran, Bermakna, Menggembirakan).

Pemanfaatan Digital (Youtube, Quizizz, KBBI Daring, dll).

Pengalaman Belajar: Kegiatan Inti wajib menyertakan label kompetensi. Contoh: "Murid berdiskusi (Mengaplikasi, Bermakna)".

Rubrik Penilaian (Killer Feature): Wajib menggunakan Taksonomi SOLO (Prestructural s.d. Extended Abstract) dalam format tabel.

E. Output & Export
Web Preview: Tampilan WYSIWYG (What You See Is What You Get) yang rapi.

Download: Tombol Floating untuk unduh .docx dan .pdf.

Privacy Alert: Banner peringatan "Data tidak disimpan. Unduh sekarang."
