# Dokumentasi Teknis Sistem RPPGen

**Versi**: 1.0  
**Tanggal**: 25 Desember 2025  
**Platform**: Next.js 14 (App Router)

---

## 1. Gambaran Arsitektur Sistem

RPPGen adalah sistem AI Engine berbasis server yang menghasilkan dokumen Rencana Pelaksanaan Pembelajaran Mendalam (RPPM) secara otomatis. Arsitektur sistem mengikuti prinsip **Server-Side Intelligence** — seluruh kecerdasan AI, logika kurikulum, dan pemrosesan data resmi berada di server.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  Web App    │    │ Flutter App │    │   Postman   │              │
│  │  (React)    │    │  (Android)  │    │   (Test)    │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                      │
│         └──────────────────┼──────────────────┘                      │
│                            ▼                                         │
│                    HTTP POST Request                                 │
│                    (JSON Payload)                                    │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVER LAYER                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     API GATE PROTECTION                         │ │
│  │  • Rate Limit (30 req/menit/IP)                                │ │
│  │  • Daily Quota (300 req/hari/IP)                               │ │
│  │  • Timeout Protection (25 detik)                               │ │
│  │  • Owner Bypass (tidak ada limit)                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   KURIKULUM ENGINE                              │ │
│  │  • CP Registry (data/cp_registry/*.json)                       │ │
│  │  • Mapping Jenjang → Fase                                      │ │
│  │  • Inject CP resmi ke prompt AI                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      AI ENGINE                                  │ │
│  │  • Groq SDK (LLaMA 3.3 70B)                                    │ │
│  │  • System Prompt (standar Kemendikdasmen)                      │ │
│  │  • Output: HTML format RPPM lengkap                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    EXPORT ENGINE                                │ │
│  │  • exportToPdf() → jsPDF + html2canvas                         │ │
│  │  • exportToDocx() → MSO HTML + file-saver                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Prinsip Arsitektur

| Prinsip | Deskripsi |
|---------|-----------|
| **Server-Side Intelligence** | Semua logika AI dan kurikulum berjalan di server |
| **Thin Client** | Client hanya mengirim input dan menerima hasil |
| **Stateless API** | Setiap request bersifat independen |
| **Data-Driven** | CP resmi di-inject dari file JSON ke prompt |

---

## 2. Alur Kerja Aplikasi

### Flow: Input User → Dokumen RPP (PDF/DOCX)

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  INPUT  │ ──▶  │   API   │ ──▶  │   CP    │ ──▶  │   AI    │ ──▶  │ EXPORT  │
│  USER   │      │  GATE   │      │ INJECT  │      │ GENERATE│      │ PDF/DOC │
└─────────┘      └─────────┘      └─────────┘      └─────────┘      └─────────┘
```

### Detail Langkah

1. **User Input** (Client)
   - User mengisi form: data sekolah, guru, kelas, mapel, topik materi
   - Client mengirim request ke `/api/generate`

2. **API Gate Check** (Server)
   - Cek apakah request dari owner (bypass all limits)
   - Jika bukan owner: cek rate limit → cek daily quota
   - Jika limit tercapai, return error langsung

3. **CP Injection** (Server)
   - Sistem menentukan Fase berdasarkan jenjang+kelas
   - Ambil Capaian Pembelajaran resmi dari `cp_registry`
   - Inject teks CP ke dalam prompt AI

4. **AI Generation** (Server)
   - Bangun prompt dengan template standar Kemendikdasmen
   - Kirim ke Groq API (LLaMA 3.3 70B)
   - Timeout protection 25 detik aktif
   - Terima response HTML lengkap

5. **Response & Export** (Client)
   - Server return `fullHtml` (dokumen RPPM lengkap)
   - Client render preview HTML
   - User bisa export ke PDF atau DOCX

---

## 3. Peran Folder cp_registry

### Struktur Direktori

```
data/cp_registry/
├── index.ts             # Utility functions
├── cp_2025.ts           # Loader/aggregator
├── cp_2025_faseA.json   # SD Kelas 1-2
├── cp_2025_faseB.json   # SD Kelas 3-4
├── cp_2025_faseC.json   # SD Kelas 5-6
├── cp_2025_faseD.json   # SMP Kelas 7-9
├── cp_2025_faseE.json   # SMA Kelas 10
└── cp_2025_faseF.json   # SMA Kelas 11-12
```

### Fungsi Utama

| File | Fungsi |
|------|--------|
| `cp_2025_fase*.json` | Database Capaian Pembelajaran resmi per fase |
| `cp_2025.ts` | Loader yang menggabungkan semua JSON |
| `index.ts` | Utility: `getPhaseByClass()`, `getCPTextForPrompt()`, dll |

### Struktur Data JSON

```json
{
  "fase_A": {
    "jenjang": "SD Kelas 1-2",
    "mapel": {
      "Matematika": {
        "elemen": {
          "Bilangan": "Menunjukkan pemahaman bilangan cacah...",
          "Aljabar": "Menunjukkan pemahaman makna simbol...",
          "Pengukuran": "Membandingkan panjang dan berat...",
          "Geometri": "Mengenal berbagai bangun datar...",
          "Analisis Data dan Peluang": "Mengurutkan, menyortir..."
        }
      },
      "Bahasa Indonesia": { ... },
      "Pendidikan Pancasila": { ... }
    }
  }
}
```

### Mapping Kelas → Fase

| Jenjang | Kelas | Fase |
|---------|-------|------|
| SD | 1-2 | Fase A |
| SD | 3-4 | Fase B |
| SD | 5-6 | Fase C |
| SMP | 7-9 | Fase D |
| SMA | 10 | Fase E |
| SMA | 11-12 | Fase F |

---

## 4. Data Resmi Kemendikdasmen

### Sumber Data Resmi

Sistem menggunakan data resmi dari **Kemendikdasmen (Kurikulum Merdeka 2025 - SK 046/2025)**:

| Data | Lokasi di Sistem | Pengaruh pada Prompt AI |
|------|------------------|-------------------------|
| Capaian Pembelajaran (CP) | `data/cp_registry/*.json` | Di-inject langsung ke prompt sebagai referensi wajib |
| Struktur Dokumen RPPM | `lib/promptTemplates.ts` | System prompt mengikuti format resmi |
| Dimensi Profil Pelajar Pancasila | System prompt | Wajib ada di setiap output |
| Deep Learning Framework | System prompt | Pedagogi: Bermakna, Berkesadaran, Menggembirakan |
| SOLO Taxonomy | System prompt | Rubrik penilaian 5 level |

### Contoh Inject CP ke Prompt

```typescript
// lib/promptTemplates.ts
const userPrompt = `
...
**CAPAIAN PEMBELAJARAN RESMI (KEMENDIKDASMEN):**
${cpText}
...
`;
```

CP yang di-inject:

```
**Bilangan**: Menunjukkan pemahaman dan memiliki intuisi bilangan 
(number sense) pada bilangan cacah sampai 100; membaca, menulis...

**Aljabar**: Menunjukan pemahaman makna simbol matematika "=" 
dalam suatu kalimat matematika...
```

---

## 5. Endpoint API

### POST `/api/generate`

**Fungsi**: Generate dokumen RPPM menggunakan AI

---

### Request

**URL**: `POST /api/generate`

**Headers**:
```
Content-Type: application/json
x-owner-key: <optional, untuk bypass limit>
```

**Body**:
```json
{
  "identity": {
    "namaSekolah": "SDN 1 Contoh",
    "namaKepsek": "Drs. Ahmad Hidayat, M.Pd",
    "nipKepsek": "196512051990031002",
    "namaGuru": "Siti Rahayu, S.Pd",
    "nipGuru": "199001152015042001",
    "kota": "Jakarta",
    "tanggalKeabsahan": "2025-01-15"
  },
  "curriculum": {
    "jenjang": "SD",
    "kelas": 4,
    "mapel": "Matematika",
    "topikMateri": "Pecahan Sederhana",
    "detailMateri": "Konsep pecahan 1/2, 1/4, 1/8",
    "semester": "Genap",
    "alokasiWaktu": "2 x 35 menit",
    "jumlahPertemuan": 1,
    "model": "PBL",
    "kondisiAwalMurid": "Murid sudah memahami bilangan bulat"
  },
  "userApiKey": "gsk_xxx (optional, user's own key)"
}
```

---

### Response Sukses

**Status**: `200 OK`

```json
{
  "success": true,
  "rppm": {
    "fullHtml": "<div style=\"font-family: 'Times New Roman'...\">...</div>",
    "generatedAt": "2025-12-25T15:30:00.000Z"
  }
}
```

`fullHtml` berisi dokumen RPPM lengkap dalam format HTML siap render.

---

### Response Error

#### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "error": "Rate limit exceeded. Coba lagi nanti."
}
```

**Headers**: `Retry-After: 45` (detik)

#### Daily Quota Exceeded (403)

```json
{
  "success": false,
  "error": "Daily quota exceeded. Kuota harian habis."
}
```

#### Gateway Timeout (504)

```json
{
  "success": false,
  "error": "GATEWAY_TIMEOUT",
  "message": "Request timeout. Server terlalu lama merespons."
}
```

#### Groq API Rate Limit (429)

```json
{
  "success": false,
  "error": "API_RATE_LIMIT",
  "message": "Batas pemakaian API tercapai. Silakan gunakan API key pribadi."
}
```

#### Input Tidak Lengkap (400)

```json
{
  "success": false,
  "error": "Data tidak lengkap"
}
```

#### Server Error (500)

```json
{
  "success": false,
  "error": "Terjadi kesalahan sistem"
}
```

---

### POST `/api/mobile/generate-rpp` (Mobile Facade)

**Fungsi**: Endpoint khusus Flutter dengan format input yang disederhanakan

> Endpoint ini adalah **facade/wrapper** yang memetakan input sederhana ke format lengkap, lalu memanggil logic yang sama dengan `/api/generate`.

---

### Request Mobile

**URL**: `POST /api/mobile/generate-rpp`

**Headers**:
```
Content-Type: application/json
x-owner-key: <optional, untuk bypass limit>
```

**Body** (format sederhana):
```json
{
  "jenjang": "SD",
  "kelas": 4,
  "mapel": "Matematika",
  "topik": "Pecahan Sederhana",
  "detailMateri": "",
  "alokasiWaktu": "2 x 35 menit",
  "jumlahPertemuan": 1,
  "model": "PBL",
  "namaSekolah": "SDN Contoh",
  "kepalaSekolah": "Nama Kepsek",
  "nipKepsek": "",
  "namaGuru": "Nama Guru",
  "nipGuru": "",
  "kota": "Jakarta"
}
```

**Field Wajib**: `jenjang`, `kelas`, `mapel`, `topik`, `namaSekolah`, `namaGuru`

---

### Response Sukses Mobile

**Status**: `200 OK`

```json
{
  "success": true,
  "rppm": {
    "fullHtml": "<div>...</div>",
    "generatedAt": "2025-12-25T15:30:00.000Z"
  },
  "source": "mobile"
}
```

---

### Response Error Mobile (Standardized)

Semua error dari endpoint mobile mengikuti format konsisten:

#### LIMIT_REACHED (429/403)

```json
{
  "error": "LIMIT_REACHED",
  "message": "Anda telah mencapai batas generate harian.",
  "upgrade_url": "https://lynk.id/gurupintar"
}
```

#### TIMEOUT (504)

```json
{
  "error": "TIMEOUT",
  "message": "Request timeout. Server terlalu lama merespons."
}
```

#### INVALID_INPUT (400)

```json
{
  "error": "INVALID_INPUT",
  "message": "Data tidak lengkap. Diperlukan: jenjang, kelas, mapel, topik."
}
```

#### SERVER_ERROR (500)

```json
{
  "error": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem."
}
```

---

## 6. Mekanisme Proteksi API

### Rate Limit

| Parameter | Nilai |
|-----------|-------|
| Limit | 30 requests |
| Window | 1 menit |
| Per | IP Address |
| Response | `429 Too Many Requests` |

### Daily Quota

| Parameter | Nilai |
|-----------|-------|
| Limit | 300 requests |
| Window | 1 hari (reset tengah malam UTC) |
| Per | IP Address |
| Response | `403 Forbidden` |

### Timeout Protection

| Parameter | Nilai |
|-----------|-------|
| Timeout | 25 detik |
| Target | Groq API call |
| Response | `504 Gateway Timeout` |

### Owner Bypass

Owner dapat melewati semua limit dengan:

1. **IP Address**: Tambahkan IP ke `OWNER_IPS` env var
2. **API Key**: Kirim header `x-owner-key` dengan nilai `OWNER_API_KEY`

```bash
# .env.local
OWNER_IPS=127.0.0.1,::1,YOUR_SERVER_IP
OWNER_API_KEY=your-secret-key-here
```

---

## 7. Sistem AI Engine (Server-Side Intelligence)

### Prinsip Desain

> **Seluruh kecerdasan sistem berada di server, bukan di client.**

| Komponen | Lokasi | Deskripsi |
|----------|--------|-----------|
| AI Model | Server | Groq API (LLaMA 3.3 70B Versatile) |
| Prompt Engineering | Server | `lib/promptTemplates.ts` |
| Kurikulum Database | Server | `data/cp_registry/*.json` |
| CP Injection Logic | Server | `getCPTextForPrompt()` |
| Rate Limiting | Server | `lib/apiGate.ts` |
| Export Logic | Client | PDF/DOCX rendering (opsional di server) |

### Mengapa Server-Side?

1. **Keamanan**: API key AI tidak exposed ke client
2. **Konsistensi**: Semua user mendapat logika yang sama
3. **Kontrol**: Mudah update kurikulum tanpa update client
4. **Proteksi**: Rate limit efektif di server

---

## 8. Integrasi dengan Aplikasi Flutter

### Arsitektur Integrasi

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUTTER APP (ANDROID)                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                        THIN CLIENT                               ││
│  │  • Form input user                                               ││
│  │  • HTTP client (dio/http)                                        ││
│  │  • HTML preview (webview)                                        ││
│  │  • File save (pdf/docx)                                          ││
│  │                                                                   ││
│  │  ❌ TIDAK ADA logika kurikulum                                   ││
│  │  ❌ TIDAK ADA logika AI                                          ││
│  │  ❌ TIDAK ADA database CP                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                       │
│                              ▼ HTTP POST                             │
│                    POST /api/generate                                │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS SERVER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      FULL AI ENGINE                              ││
│  │  ✅ Logika kurikulum (CP Registry)                              ││
│  │  ✅ Logika AI (Prompt Engineering + Groq)                       ││
│  │  ✅ Rate limiting & proteksi                                    ││
│  │  ✅ Data resmi Kemendikdasmen                                   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Tanggung Jawab Flutter

| Tugas | Deskripsi |
|-------|-----------|
| **Form Input** | Mengumpulkan data user (sekolah, guru, mapel, dll) |
| **HTTP Request** | Mengirim JSON ke `/api/generate` |
| **Preview HTML** | Render `fullHtml` di WebView |
| **Save File** | Simpan PDF/DOCX ke penyimpanan device |
| **Error Handling** | Tampilkan pesan error dari API |

### Tanggung Jawab Next.js Server

| Tugas | Deskripsi |
|-------|-----------|
| **Validasi Input** | Pastikan data lengkap |
| **CP Lookup** | Ambil Capaian Pembelajaran dari registry |
| **AI Generation** | Bangun prompt + panggil Groq API |
| **Rate Limiting** | Lindungi dari abuse |
| **Return HTML** | Kembalikan dokumen RPPM lengkap |

### Contoh Kode Flutter (Menggunakan Mobile Endpoint)

```dart
// models/mobile_rpp_input.dart
class MobileRppInput {
  final String jenjang;      // "SD", "SMP", "SMA"
  final int kelas;
  final String mapel;
  final String topik;
  final String namaSekolah;
  final String namaGuru;
  final String? kepalaSekolah;
  final String? nipKepsek;
  final String? nipGuru;
  final String? alokasiWaktu;
  final int? jumlahPertemuan;
  final String? model;
  final String? kota;

  MobileRppInput({
    required this.jenjang,
    required this.kelas,
    required this.mapel,
    required this.topik,
    required this.namaSekolah,
    required this.namaGuru,
    this.kepalaSekolah,
    this.nipKepsek,
    this.nipGuru,
    this.alokasiWaktu,
    this.jumlahPertemuan,
    this.model,
    this.kota,
  });

  Map<String, dynamic> toJson() => {
    'jenjang': jenjang,
    'kelas': kelas,
    'mapel': mapel,
    'topik': topik,
    'namaSekolah': namaSekolah,
    'namaGuru': namaGuru,
    if (kepalaSekolah != null) 'kepalaSekolah': kepalaSekolah,
    if (nipKepsek != null) 'nipKepsek': nipKepsek,
    if (nipGuru != null) 'nipGuru': nipGuru,
    if (alokasiWaktu != null) 'alokasiWaktu': alokasiWaktu,
    if (jumlahPertemuan != null) 'jumlahPertemuan': jumlahPertemuan,
    if (model != null) 'model': model,
    if (kota != null) 'kota': kota,
  };
}

// services/api_service.dart
class RppApiService {
  static const String baseUrl = 'https://your-nextjs-server.com';
  
  Future<RppResponse> generateRpp(MobileRppInput input) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/generate-rpp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(input.toJson()),
    );
    
    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      return RppResponse(
        success: true,
        fullHtml: data['rppm']['fullHtml'],
        generatedAt: data['rppm']['generatedAt'],
      );
    }
    
    // Handle standardized mobile errors
    final error = data['error'] ?? 'SERVER_ERROR';
    final message = data['message'] ?? 'Terjadi kesalahan';
    final upgradeUrl = data['upgrade_url'];
    
    switch (error) {
      case 'LIMIT_REACHED':
        throw LimitException(message, upgradeUrl: upgradeUrl);
      case 'TIMEOUT':
        throw TimeoutException(message);
      case 'INVALID_INPUT':
        throw ValidationException(message);
      default:
        throw ApiException(message);
    }
  }
}
```

### Kontrak API untuk Flutter

Dokumen ini menjadi **kontrak resmi** untuk pengembangan aplikasi Flutter Android:

1. **Endpoint Mobile**: `POST /api/mobile/generate-rpp` (format sederhana)
2. **Endpoint Web**: `POST /api/generate` (format lengkap, tetap tersedia)
3. **Format request**: JSON flat tanpa nested objects
4. **Format response**: JSON dengan `fullHtml` (HTML string)
5. **Error format**: Konsisten dengan `error`, `message`, `upgrade_url`
6. **No client-side logic**: Flutter TIDAK perlu memahami kurikulum atau AI

---

## Lampiran: Environment Variables

```bash
# .env.local (Server)

# Groq AI
GROQ_API_KEY=gsk_xxx...

# Owner Bypass
OWNER_IPS=127.0.0.1,::1
OWNER_API_KEY=your-secret-key

# Optional: Google Sheets integration
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="..."
GOOGLE_SHEET_ID=...
```

---

*Dokumen ini adalah referensi teknis untuk Developer yang mengembangkan atau mengintegrasikan sistem RPPGen.*
