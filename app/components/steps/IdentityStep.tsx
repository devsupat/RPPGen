'use client';

import { School, User, IdCard } from 'lucide-react';
import type { IdentityInput } from '@/types';

interface IdentityStepProps {
    data: IdentityInput;
    onChange: (data: IdentityInput) => void;
}

export default function IdentityStep({ data, onChange }: IdentityStepProps) {
    const updateField = (field: keyof IdentityInput, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-8">
            {/* Nama Sekolah */}
            <div className="form-group mb-0">
                <label htmlFor="namaSekolah" className="label label-required">
                    Nama Sekolah
                </label>
                <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        id="namaSekolah"
                        value={data.namaSekolah}
                        onChange={(e) => updateField('namaSekolah', e.target.value)}
                        placeholder="Contoh: SDN 01 Menteng Jakarta"
                        className="input pl-12"
                    />
                </div>
            </div>

            {/* Kepala Sekolah Section */}
            <div className="card-section">
                <div className="flex items-center gap-2 mb-5">
                    <User className="w-5 h-5 text-neutral-600" />
                    <h3 className="font-semibold text-neutral-800">Data Kepala Sekolah</h3>
                </div>

                <div className="form-grid">
                    {/* Nama Kepsek */}
                    <div className="form-group mb-0">
                        <label htmlFor="namaKepsek" className="label label-required">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="namaKepsek"
                            value={data.namaKepsek}
                            onChange={(e) => updateField('namaKepsek', e.target.value)}
                            placeholder="Nama lengkap dengan gelar"
                            className="input"
                        />
                    </div>

                    {/* NIP Kepsek */}
                    <div className="form-group mb-0">
                        <label htmlFor="nipKepsek" className="label label-required">
                            NIP
                        </label>
                        <div className="relative">
                            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                id="nipKepsek"
                                value={data.nipKepsek}
                                onChange={(e) => updateField('nipKepsek', e.target.value)}
                                placeholder="18 digit NIP"
                                className="input pl-12"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Guru Section */}
            <div className="card-section card-section-primary">
                <div className="flex items-center gap-2 mb-5">
                    <User className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-primary-800">Data Guru Pengajar</h3>
                </div>

                <div className="form-grid">
                    {/* Nama Guru */}
                    <div className="form-group mb-0">
                        <label htmlFor="namaGuru" className="label label-required">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="namaGuru"
                            value={data.namaGuru}
                            onChange={(e) => updateField('namaGuru', e.target.value)}
                            placeholder="Nama lengkap dengan gelar"
                            className="input"
                        />
                    </div>

                    {/* NIP Guru (Optional) */}
                    <div className="form-group mb-0">
                        <label htmlFor="nipGuru" className="label">
                            NIP
                            <span className="text-neutral-400 font-normal ml-1">(opsional)</span>
                        </label>
                        <div className="relative">
                            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                id="nipGuru"
                                value={data.nipGuru || ''}
                                onChange={(e) => updateField('nipGuru', e.target.value)}
                                placeholder="Kosongkan jika belum ada"
                                className="input pl-12"
                            />
                        </div>
                        <p className="form-hint">
                            Kosongkan jika Anda belum memiliki NIP
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
