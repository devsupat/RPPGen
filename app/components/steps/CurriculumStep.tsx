'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, FileText, Users } from 'lucide-react';
import {
    getJenjangOptions,
    getClassesByJenjang,
    getPhaseByClass,
    getSubjectsByPhase,
    getPhaseLabel
} from '@/data/cp_registry';
import type { CurriculumInput, PhaseName } from '@/types';

interface CurriculumStepProps {
    data: CurriculumInput;
    onChange: (data: CurriculumInput) => void;
}

export default function CurriculumStep({ data, onChange }: CurriculumStepProps) {
    const [availableClasses, setAvailableClasses] = useState<number[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [phaseLabel, setPhaseLabel] = useState<string>('');

    // Update classes when jenjang changes
    useEffect(() => {
        if (data.jenjang) {
            const classes = getClassesByJenjang(data.jenjang);
            setAvailableClasses(classes);

            // Reset kelas if not valid for new jenjang
            if (!classes.includes(data.kelas)) {
                onChange({ ...data, kelas: 0, mapel: '', fase: '' as PhaseName });
            }
        } else {
            setAvailableClasses([]);
        }
    }, [data.jenjang]);

    // Update subjects when kelas changes
    useEffect(() => {
        if (data.jenjang && data.kelas) {
            const fase = getPhaseByClass(data.jenjang, data.kelas);
            if (fase) {
                const subjects = getSubjectsByPhase(fase);
                setAvailableSubjects(subjects);
                setPhaseLabel(getPhaseLabel(fase));

                // Update fase in data
                if (data.fase !== fase) {
                    onChange({ ...data, fase, mapel: '' });
                }
            }
        } else {
            setAvailableSubjects([]);
            setPhaseLabel('');
        }
    }, [data.jenjang, data.kelas]);

    const updateField = (field: keyof CurriculumInput, value: string | number) => {
        onChange({ ...data, [field]: value });
    };

    const jenjangOptions = getJenjangOptions();

    return (
        <div className="space-y-8">
            {/* Jenjang & Kelas */}
            <div className="card-section">
                <div className="flex items-center gap-2 mb-5">
                    <GraduationCap className="w-5 h-5 text-neutral-600" />
                    <h3 className="font-semibold text-neutral-800">Tingkat Pendidikan</h3>
                </div>

                <div className="form-grid">
                    {/* Jenjang */}
                    <div className="form-group mb-0">
                        <label htmlFor="jenjang" className="label label-required">
                            Jenjang
                        </label>
                        <select
                            id="jenjang"
                            value={data.jenjang || ''}
                            onChange={(e) => updateField('jenjang', e.target.value as 'SD' | 'SMP' | 'SMA')}
                            className="input select"
                        >
                            <option value="">Pilih Jenjang</option>
                            {jenjangOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Kelas */}
                    <div className="form-group mb-0">
                        <label htmlFor="kelas" className="label label-required">
                            Kelas
                        </label>
                        <select
                            id="kelas"
                            value={data.kelas || ''}
                            onChange={(e) => updateField('kelas', parseInt(e.target.value, 10))}
                            className="input select"
                            disabled={!data.jenjang}
                        >
                            <option value="">Pilih Kelas</option>
                            {availableClasses.map((kelas) => (
                                <option key={kelas} value={kelas}>
                                    Kelas {kelas}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Phase Indicator */}
                {phaseLabel && (
                    <div className="alert alert-success mt-5">
                        <GraduationCap className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{phaseLabel}</span>
                    </div>
                )}
            </div>

            {/* Mata Pelajaran */}
            <div className="card-section card-section-primary">
                <div className="flex items-center gap-2 mb-5">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-primary-800">Mata Pelajaran</h3>
                </div>

                <div className="form-group mb-0">
                    <label htmlFor="mapel" className="label label-required">
                        Pilih Mata Pelajaran
                    </label>
                    <select
                        id="mapel"
                        value={data.mapel || ''}
                        onChange={(e) => updateField('mapel', e.target.value)}
                        className="input select"
                        disabled={availableSubjects.length === 0}
                    >
                        <option value="">
                            {availableSubjects.length > 0
                                ? 'Pilih Mata Pelajaran'
                                : 'Pilih jenjang & kelas terlebih dahulu'}
                        </option>
                        {availableSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                    {availableSubjects.length > 0 && (
                        <p className="form-hint">
                            {availableSubjects.length} mata pelajaran tersedia untuk fase ini
                        </p>
                    )}
                </div>
            </div>

            {/* Topik Materi */}
            <div className="form-group">
                <label htmlFor="topikMateri" className="label label-required">
                    Topik / Materi Pembelajaran
                </label>
                <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-neutral-400" />
                    <textarea
                        id="topikMateri"
                        value={data.topikMateri || ''}
                        onChange={(e) => updateField('topikMateri', e.target.value)}
                        placeholder="Contoh: Operasi Hitung Bilangan Pecahan"
                        className="input pl-12 min-h-[100px] resize-none"
                        rows={3}
                    />
                </div>
                <p className="form-hint">
                    Tuliskan topik atau materi spesifik yang akan diajarkan
                </p>
            </div>

            {/* Kondisi Awal Murid (Optional) */}
            <div className="form-group mb-0">
                <label htmlFor="kondisiAwalMurid" className="label">
                    Kondisi Awal Murid
                    <span className="text-neutral-400 font-normal ml-1">(opsional)</span>
                </label>
                <div className="relative">
                    <Users className="absolute left-4 top-4 w-5 h-5 text-neutral-400" />
                    <textarea
                        id="kondisiAwalMurid"
                        value={data.kondisiAwalMurid || ''}
                        onChange={(e) => updateField('kondisiAwalMurid', e.target.value)}
                        placeholder="Contoh: Sebagian besar murid sudah menguasai konsep pecahan sederhana, namun masih kesulitan dengan pecahan campuran"
                        className="input pl-12 min-h-[100px] resize-none"
                        rows={3}
                    />
                </div>
                <p className="form-hint">
                    Informasi ini membantu AI membuat diferensiasi pembelajaran yang lebih tepat
                </p>
            </div>
        </div>
    );
}
