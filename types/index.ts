// Types for GuruPintar AI - RPPM Generator

// ============================================
// CP Registry Types
// ============================================

export interface CPElement {
    elemen: Record<string, string>;
}

export interface MapelRegistry {
    [mapel: string]: CPElement;
}

export interface PhaseData {
    jenjang: string;
    mapel: MapelRegistry;
    mata_pelajaran_pilihan?: MapelRegistry;
}

export type PhaseName = 'fase_A' | 'fase_B' | 'fase_C' | 'fase_D' | 'fase_E' | 'fase_F';

// ============================================
// User & Authentication Types
// ============================================

export interface User {
    accessCode: string;
    nama: string;
    sekolah: string;
    deviceHash: string;
    isLocked: boolean;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
}

// ============================================
// Form Input Types (Wizard Steps)
// ============================================

export interface IdentityInput {
    namaSekolah: string;
    namaKepsek: string;
    nipKepsek: string;
    namaGuru: string;
    nipGuru?: string; // Optional
}

export interface CurriculumInput {
    jenjang: 'SD' | 'SMP' | 'SMA';
    kelas: number;
    fase: PhaseName;
    mapel: string;
    topikMateri: string;
    kondisiAwalMurid?: string; // Optional - untuk diagnostik
}

export interface RPPMInput {
    identity: IdentityInput;
    curriculum: CurriculumInput;
}

// ============================================
// RPPM Output Types (Generated Result)
// ============================================

export interface IdentifikasiMurid {
    karakteristikMurid: string;
    karakterMateri: string;
    dimensiProfilLulusan: string[];
}

export interface DesainPembelajaran {
    model: 'PBL' | 'PjBL';
    pendekatanDeepLearning: {
        berkesadaran: string;
        bermakna: string;
        menggembirakan: string;
    };
    pemanfaatanDigital: string[];
}

export interface KegiatanPembelajaran {
    pendahuluan: string[];
    kegiatan_inti: {
        deskripsi: string;
        labelKompetensi: string; // e.g., "Mengaplikasi, Bermakna"
    }[];
    penutup: string[];
}

// Taksonomi SOLO Levels
export type SOLOLevel =
    | 'Prestructural'
    | 'Unistructural'
    | 'Multistructural'
    | 'Relational'
    | 'Extended Abstract';

export interface RubrikPenilaian {
    level: SOLOLevel;
    deskripsi: string;
    indikator: string;
}

export interface RPPMOutput {
    // Header
    judul: string;
    sekolah: string;
    kepsek: { nama: string; nip: string };
    guru: { nama: string; nip?: string };
    mapel: string;
    kelas: string;
    fase: string;
    topik: string;

    // Capaian Pembelajaran (from CP Registry)
    capaianPembelajaran: Record<string, string>;

    // Deep Learning Structure
    identifikasi: IdentifikasiMurid;
    desainPembelajaran: DesainPembelajaran;
    pengalamanBelajar: KegiatanPembelajaran;

    // Killer Feature: Taksonomi SOLO
    rubrikPenilaian: RubrikPenilaian[];
}

// ============================================
// Form Wizard Types
// ============================================

export interface FormStep {
    id: number;
    title: string;
    description: string;
}

export type WizardStep = 'identity' | 'curriculum' | 'preview';

// ============================================
// API Response Types
// ============================================

export interface GenerateResponse {
    success: boolean;
    rppm?: RPPMOutput;
    error?: string;
}
