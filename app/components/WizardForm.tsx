'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Check } from 'lucide-react';
import IdentityStep from './steps/IdentityStep';
import CurriculumStep from './steps/CurriculumStep';
import type { RPPMInput, IdentityInput, CurriculumInput, PhaseName } from '@/types';

interface WizardFormProps {
    userSekolah?: string;
    onGenerate: (rppm: Record<string, unknown>) => void;
}

const STEPS = [
    { id: 1, title: 'Identitas', description: 'Data sekolah & guru' },
    { id: 2, title: 'Kurikulum', description: 'Mata pelajaran & materi' },
];

export default function WizardForm({ userSekolah, onGenerate }: WizardFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [identityData, setIdentityData] = useState<IdentityInput>({
        namaSekolah: userSekolah || '',
        namaKepsek: '',
        nipKepsek: '',
        namaGuru: '',
        nipGuru: '',
    });

    const [curriculumData, setCurriculumData] = useState<CurriculumInput>({
        jenjang: '' as 'SD' | 'SMP' | 'SMA',
        kelas: 0,
        fase: '' as PhaseName,
        mapel: '',
        topikMateri: '',
        kondisiAwalMurid: '',
    });

    const validateStep = (step: number): string | null => {
        if (step === 1) {
            if (!identityData.namaSekolah.trim()) return 'Nama sekolah harus diisi';
            if (!identityData.namaKepsek.trim()) return 'Nama kepala sekolah harus diisi';
            if (!identityData.nipKepsek.trim()) return 'NIP kepala sekolah harus diisi';
            if (!identityData.namaGuru.trim()) return 'Nama guru harus diisi';
        }

        if (step === 2) {
            if (!curriculumData.jenjang) return 'Pilih jenjang pendidikan';
            if (!curriculumData.kelas) return 'Pilih kelas';
            if (!curriculumData.mapel) return 'Pilih mata pelajaran';
            if (!curriculumData.topikMateri.trim()) return 'Topik materi harus diisi';
        }

        return null;
    };

    const handleNext = () => {
        const validationError = validateStep(currentStep);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleGenerate = async () => {
        const validationError = validateStep(2);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const input: RPPMInput = {
                identity: identityData,
                curriculum: curriculumData,
            };

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            const data = await response.json();

            if (data.success) {
                onGenerate(data.rppm);
            } else {
                setError(data.error || 'Gagal menghasilkan RPPM');
            }
        } catch {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Step Indicator */}
            <div className="step-container mb-10">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`step-item ${currentStep > step.id ? 'completed' :
                                currentStep === step.id ? 'active' : ''
                            }`}>
                            <div
                                className={`step-circle ${currentStep > step.id
                                        ? 'completed'
                                        : currentStep === step.id
                                            ? 'active'
                                            : 'pending'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            <span className="step-label">{step.title}</span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Form Card */}
            <div className="card-elevated animate-fade-in-up">
                {/* Card Header */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-neutral-100">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        {STEPS[currentStep - 1].title}
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">
                        {STEPS[currentStep - 1].description}
                    </p>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-6 animate-fade-in">
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Step Content */}
                    <div key={currentStep} className="animate-slide-in">
                        {currentStep === 1 && (
                            <IdentityStep data={identityData} onChange={setIdentityData} />
                        )}
                        {currentStep === 2 && (
                            <CurriculumStep data={curriculumData} onChange={setCurriculumData} />
                        )}
                    </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 bg-neutral-50 rounded-b-xl border-t border-neutral-100">
                    <div className="flex justify-between items-center gap-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 1 || isGenerating}
                            className={`btn btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Sebelumnya
                        </button>

                        {currentStep < STEPS.length ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="btn btn-primary btn-lg"
                            >
                                Selanjutnya
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="btn btn-success btn-lg"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menghasilkan...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Hasilkan RPPM
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Privacy Notice */}
            <p className="text-center text-sm text-neutral-400 mt-8">
                🔒 Data Anda tidak disimpan di server. RPPM dihasilkan secara real-time.
            </p>
        </div>
    );
}
