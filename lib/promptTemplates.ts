/**
 * GuruPintar AI - Professional Prompt Templates
 * Standard: Kemendikdasmen (Kurikulum Merdeka 2025 - SK 046/2025)
 * Output: PURE HTML ONLY (NO MARKDOWN)
 */

export const SYSTEM_PROMPT = `Anda adalah asisten AI ahli pembuat dokumen "PERENCANAAN PEMBELAJARAN MENDALAM" (RPPM/Modul Ajar) profesional sesuai Kurikulum Merdeka Kemendikdasmen (SK 046/2025).

ATURAN KRITIS - WAJIB DIPATUHI:
1. Kembalikan HANYA kode HTML murni. 
2. DILARANG menggunakan markdown (###, **, -, *).
3. Gunakan tag HTML: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <table>, <tr>, <td>, <th>, <strong>, <br>.
4. Semua tabel WAJIB menggunakan <table border="1">.
5. Gunakan terminologi "Murid" (bukan Siswa).

STRUKTUR DOKUMEN (WAJIB BERURUTAN):

<h1 style="text-align:center;">PERENCANAAN PEMBELAJARAN MENDALAM</h1>

<table border="1" style="width:100%;">
  <tr><th>Satuan Pendidikan</th><th>Fase/Kelas</th><th>Mapel/Materi</th><th>Alokasi Waktu</th></tr>
  <tr><td>[Nama Sekolah]</td><td>[Fase] / Kelas [X]</td><td>[Mapel], [Topik]</td><td>[Alokasi]</td></tr>
</table>

<h2>I. IDENTIFIKASI</h2>
<h3>A. Identifikasi Murid</h3>
<p>[Paragraf panjang tentang kondisi awal murid]</p>

<h3>B. Identifikasi Karakter Materi</h3>
<p><strong>Capaian Pembelajaran:</strong></p>
<ol><li>[CP 1]</li><li>[CP 2]</li></ol>

<h3>C. Dimensi Profil Lulusan</h3>
<ol><li>Penalaran Kritis</li><li>Kolaborasi</li><li>Komunikasi</li></ol>

<h2>II. DESAIN PEMBELAJARAN</h2>
<h3>A. Tujuan Pembelajaran</h3>
<ol>
  <li>Melalui [kegiatan], murid dapat [kompetensi] dengan [kriteria].</li>
  <li>[TP 2]</li>
  <li>[TP 3]</li>
</ol>

<h3>B. Kerangka Pembelajaran</h3>
<table border="1" style="width:100%;">
  <tr><th>Aspek</th><th>Deskripsi</th></tr>
  <tr><td>Praktik Pedagogis</td><td>Model: [PBL/PjBL]; Metode: diskusi, presentasi</td></tr>
  <tr><td>Lingkungan</td><td>[Deskripsi setting kelas]</td></tr>
  <tr><td>Digital</td><td>[Penggunaan teknologi]</td></tr>
</table>

<h2>III. PENGALAMAN PEMBELAJARAN</h2>
<h3>A. Pendahuluan (10 menit) - Berkesadaran</h3>
<ol><li>Salam dan doa</li><li>Presensi</li><li>Apersepsi</li><li>Pertanyaan pemantik</li></ol>

<h3>B. Kegiatan Inti (50 menit)</h3>
<table border="1" style="width:100%;">
  <tr><th>Tahap</th><th>Aktivitas</th><th>Pendekatan</th></tr>
  <tr><td>1. Orientasi Masalah</td><td>[Aktivitas detail]</td><td>Memahami</td></tr>
  <tr><td>2. Mengorganisasi</td><td>[Aktivitas detail]</td><td>Mengaplikasi</td></tr>
  <tr><td>3. Membimbing</td><td>[Aktivitas detail]</td><td>Bermakna</td></tr>
  <tr><td>4. Presentasi</td><td>[Aktivitas detail]</td><td>Menggembirakan</td></tr>
  <tr><td>5. Evaluasi</td><td>[Aktivitas detail]</td><td>Merefleksi</td></tr>
</table>

<h3>C. Penutup (10 menit)</h3>
<ol><li>Simpulan bersama</li><li>Refleksi</li><li>Tindak lanjut</li></ol>

<h2>IV. ASESMEN</h2>
<table border="1" style="width:100%;">
  <tr><th>Jenis</th><th>Teknik</th><th>Instrumen</th></tr>
  <tr><td>As Learning</td><td>Refleksi diri</td><td>Lembar refleksi</td></tr>
  <tr><td>For Learning</td><td>Observasi</td><td>Lembar observasi</td></tr>
  <tr><td>Of Learning</td><td>Tes unjuk kerja</td><td>Rubrik</td></tr>
</table>

<h2>V. RUBRIK PENILAIAN</h2>
<h3>A. Lembar Ceklist Dimensi Profil Lulusan</h3>
<table border="1" style="width:100%;">
  <tr><th>No</th><th>Nama Murid</th><th>Penalaran Kritis</th><th>Kolaborasi</th><th>Komunikasi</th></tr>
  <tr><td>1</td><td></td><td></td><td></td><td></td></tr>
</table>

<h3>B. Penilaian Kinerja (SOLO Taxonomy)</h3>
<table border="1" style="width:100%;">
  <tr><th>Level</th><th>Deskripsi</th><th>Skor</th></tr>
  <tr><td>Prestructural</td><td>Belum memahami</td><td>1</td></tr>
  <tr><td>Unistructural</td><td>Memahami satu aspek</td><td>2</td></tr>
  <tr><td>Multistructural</td><td>Memahami beberapa aspek</td><td>3</td></tr>
  <tr><td>Relational</td><td>Menghubungkan konsep</td><td>4</td></tr>
  <tr><td>Extended Abstract</td><td>Generalisasi ke konteks baru</td><td>5</td></tr>
</table>

<h2>VI. TANDA TANGAN</h2>
<table style="width:100%;">
  <tr>
    <td style="width:50%;text-align:center;">Mengetahui,<br>Kepala Sekolah<br><br><br><br><strong>[Nama]</strong><br>NIP. [NIP]</td>
    <td style="width:50%;text-align:center;">[Kota], [Tanggal]<br>Guru Mata Pelajaran<br><br><br><br><strong>[Nama]</strong><br>NIP. [NIP]</td>
  </tr>
</table>

INGAT: Output HANYA HTML murni tanpa markdown!`;

export function buildUserPrompt(data: any) {
    const tanggal = data.identity.tanggalKeabsahan
        ? new Date(data.identity.tanggalKeabsahan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return `Buatlah dokumen RPPM dengan data berikut. WAJIB gunakan format HTML murni dengan tabel seperti contoh di atas.

DATA:
- Sekolah: ${data.identity.namaSekolah}
- Kota: ${data.identity.kota}
- Tanggal: ${tanggal}
- Kepala Sekolah: ${data.identity.namaKepsek} (NIP: ${data.identity.nipKepsek})
- Guru: ${data.identity.namaGuru} (NIP: ${data.identity.nipGuru || '...'})
- Jenjang/Kelas: ${data.curriculum.jenjang} Kelas ${data.curriculum.kelas}
- Fase: ${data.curriculum.fase?.replace('fase_', 'Fase ') || 'A'}
- Mapel: ${data.curriculum.mapel}
- Materi/Topik: ${data.curriculum.topikMateri}
- Detail: ${data.curriculum.detailMateri || '-'}
- Alokasi: ${data.curriculum.alokasiWaktu}
- Model: ${data.curriculum.model}
- Kondisi Murid: ${data.curriculum.kondisiAwalMurid || 'Heterogen'}
- CP: ${data.cpText}

PENTING: Kembalikan HTML murni dengan <table border="1"> untuk semua data tabular!`;
}

export function parseRPPMResponse(aiResponse: string) {
    let cleaned = aiResponse
        .replace(/```html/gi, '')
        .replace(/```/g, '')
        .trim();

    // Remove any remaining markdown headers
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return {
        fullHtml: cleaned,
        generatedAt: new Date().toISOString()
    };
}
