// lib/curriculum.ts
// Curriculum utilities for mobile API

import { getPhaseByClass, getSubjectsByPhase, getPhaseLabel } from '@/data/cp_registry';
import type { PhaseName } from '@/types';

export interface CurriculumResponse {
    fase: string;
    faseLabel: string;
    mataPelajaran: string[];
}

/**
 * Get curriculum data based on jenjang and kelas
 * @param jenjang - SD, SMP, or SMA
 * @param kelas - Class number as string (1-12)
 * @returns CurriculumResponse with fase and available subjects
 */
export function getCurriculum(jenjang: string, kelas: string): CurriculumResponse | null {
    const validJenjang = jenjang.toUpperCase() as 'SD' | 'SMP' | 'SMA';
    const kelasNum = parseInt(kelas, 10);

    if (!['SD', 'SMP', 'SMA'].includes(validJenjang)) {
        return null;
    }

    if (isNaN(kelasNum) || kelasNum < 1 || kelasNum > 12) {
        return null;
    }

    const fase = getPhaseByClass(validJenjang, kelasNum);
    if (!fase) {
        return null;
    }

    const mataPelajaran = getSubjectsByPhase(fase);
    const faseLabel = getPhaseLabel(fase);

    return {
        fase,
        faseLabel,
        mataPelajaran,
    };
}
