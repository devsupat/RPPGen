// Types for GuruDok AI - RPPM Generator

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
    nipGuru?: string;
    kota: string;
    tanggalKeabsahan?: string;
}

export interface CurriculumInput {
    jenjang: 'SD' | 'SMP' | 'SMA';
    kelas: number;
    fase: PhaseName;
    mapel: string;
    topikMateri: string;
    detailMateri?: string;
    semester: string;
    alokasiWaktu: string;
    jumlahPertemuan: number;
    model: string;
    kondisiAwalMurid?: string;
}

export interface RPPMInput {
    identity: IdentityInput;
    curriculum: CurriculumInput;
}

// ============================================
// RPPM Output Types (Generated Result)
// ============================================

export interface RPPMOutput {
    fullHtml: string;
    generatedAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface GenerateResponse {
    success: boolean;
    rppm?: RPPMOutput;
    isDemo?: boolean;
    error?: string;
}
