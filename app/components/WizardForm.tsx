'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Clock, Users, BookOpen, FileText, Target, Settings } from 'lucide-react';
import {
    getJenjangOptions,
    getClassesByJenjang,
    getPhaseByClass,
    getSubjectsByPhase,
    getPhaseLabel
} from '@/data/cp_registry';
import type { RPPMInput, IdentityInput, CurriculumInput, PhaseName } from '@/types';

interface WizardFormProps {
    userSekolah?: string;
    userName?: string;
    onGenerate: (rppm: Record<string, unknown>) => void;
}

const MODEL_PEMBELAJARAN = [
    { value: 'PBL', label: 'Problem Based Learning (PBL)' },
    { value: 'PjBL', label: 'Project Based Learning (PjBL)' },
    { value: 'Discovery', label: 'Discovery Learning' },
    { value: 'Inquiry', label: 'Inquiry Learning' },
    { value: 'Cooperative', label: 'Cooperative Learning' },
    { value: 'Contextual', label: 'Contextual Teaching Learning' },
];

const ALOKASI_WAKTU = [
    '1 x 35 menit',
    '2 x 35 menit',
    '3 x 35 menit',
    '2 x 40 menit',
    '2 x 45 menit',
    '3 x 45 menit',
];

export default function WizardForm({ userSekolah, userName, onGenerate }: WizardFormProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Identity fields - don't use userSekolah if it's a role name
    const isValidSekolah = userSekolah && !['Teacher', 'Admin', 'Guru', 'User'].includes(userSekolah);
    const [namaSekolah, setNamaSekolah] = useState(isValidSekolah ? userSekolah : '');
    const [namaKepsek, setNamaKepsek] = useState('');
    const [nipKepsek, setNipKepsek] = useState('');
    const [namaGuru, setNamaGuru] = useState(userName || '');
    const [nipGuru, setNipGuru] = useState('');

    // Curriculum fields
    const [jenjang, setJenjang] = useState<'SD' | 'SMP' | 'SMA' | ''>('');
    const [kelas, setKelas] = useState<number>(0);
    const [fase, setFase] = useState<PhaseName | ''>('');
    const [mapel, setMapel] = useState('');
    const [semester, setSemester] = useState<'1' | '2'>('1');

    // Learning design fields
    const [topikMateri, setTopikMateri] = useState('');
    const [detailMateri, setDetailMateri] = useState('');
    const [alokasiWaktu, setAlokasiWaktu] = useState('2 x 35 menit');
    const [jumlahPertemuan, setJumlahPertemuan] = useState('1');
    const [modelPembelajaran, setModelPembelajaran] = useState('PBL');
    const [kondisiAwalMurid, setKondisiAwalMurid] = useState('');

    // Dynamic data
    const [availableClasses, setAvailableClasses] = useState<number[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [phaseLabel, setPhaseLabel] = useState('');

    // Update classes when jenjang changes
    useEffect(() => {
        if (jenjang) {
            const classes = getClassesByJenjang(jenjang);
            setAvailableClasses(classes);
            if (!classes.includes(kelas)) {
                setKelas(0);
                setMapel('');
            }
        } else {
            setAvailableClasses([]);
        }
    }, [jenjang]);

    // Update subjects when kelas changes
    useEffect(() => {
        if (jenjang && kelas) {
            const faseResult = getPhaseByClass(jenjang, kelas);
            if (faseResult) {
                const subjects = getSubjectsByPhase(faseResult);
                setAvailableSubjects(subjects);
                setPhaseLabel(getPhaseLabel(faseResult));
                setFase(faseResult);
            }
        } else {
            setAvailableSubjects([]);
            setPhaseLabel('');
        }
    }, [jenjang, kelas]);

    const handleGenerate = async () => {
        // Validation
        if (!namaSekolah.trim()) { setError('Nama sekolah harus diisi'); return; }
        if (!namaKepsek.trim()) { setError('Nama kepala sekolah harus diisi'); return; }
        if (!nipKepsek.trim()) { setError('NIP kepala sekolah harus diisi'); return; }
        if (!namaGuru.trim()) { setError('Nama guru harus diisi'); return; }
        if (!jenjang) { setError('Pilih jenjang pendidikan'); return; }
        if (!kelas) { setError('Pilih kelas'); return; }
        if (!mapel) { setError('Pilih mata pelajaran'); return; }
        if (!topikMateri.trim()) { setError('Topik materi harus diisi'); return; }

        setIsGenerating(true);
        setError(null);

        try {
            const input: RPPMInput = {
                identity: {
                    namaSekolah,
                    namaKepsek,
                    nipKepsek,
                    namaGuru,
                    nipGuru,
                },
                curriculum: {
                    jenjang: jenjang as 'SD' | 'SMP' | 'SMA',
                    kelas,
                    fase: fase as PhaseName,
                    mapel,
                    topikMateri,
                    kondisiAwalMurid,
                },
            };

            // Add extended fields as metadata
            const extendedInput = {
                ...input,
                extended: {
                    semester,
                    detailMateri,
                    alokasiWaktu,
                    jumlahPertemuan: parseInt(jumlahPertemuan),
                    modelPembelajaran,
                }
            };

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(extendedInput),
            });

            const data = await response.json();

            if (data.success) {
                // Merge extended data into response
                const rppmWithExtended = {
                    ...data.rppm,
                    alokasiWaktu,
                    jumlahPertemuan,
                    semester,
                    modelPembelajaran: MODEL_PEMBELAJARAN.find(m => m.value === modelPembelajaran)?.label,
                };
                onGenerate(rppmWithExtended);
            } else {
                setError(data.error || 'Gagal menghasilkan RPPM');
            }
        } catch {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    const jenjangOptions = getJenjangOptions();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT PANEL - Form Input (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div className="card p-5">
                    <h2 className="text-xl font-bold text-gray-900">Generator RPPM Deep Learning</h2>
                    <p className="text-sm text-gray-500">Kurikulum Merdeka · SK 046/2025</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-error">
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Data Sekolah */}
                <div className="card p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Data Sekolah & Guru
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="label label-required">Nama Sekolah</label>
                            <input
                                type="text"
                                value={namaSekolah}
                                onChange={(e) => setNamaSekolah(e.target.value)}
                                placeholder="Tulis Nama Sekolah Anda (contoh: SDN 01 Menteng)"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label label-required">Nama Kepala Sekolah</label>
                            <input
                                type="text"
                                value={namaKepsek}
                                onChange={(e) => setNamaKepsek(e.target.value)}
                                placeholder="Nama lengkap dengan gelar"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label label-required">NIP Kepala Sekolah</label>
                            <input
                                type="text"
                                value={nipKepsek}
                                onChange={(e) => setNipKepsek(e.target.value)}
                                placeholder="18 digit NIP"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label label-required">Nama Guru Penyusun</label>
                            <input
                                type="text"
                                value={namaGuru}
                                onChange={(e) => setNamaGuru(e.target.value)}
                                placeholder="Nama lengkap dengan gelar"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">NIP Guru <span className="text-gray-400">(opsional)</span></label>
                            <input
                                type="text"
                                value={nipGuru}
                                onChange={(e) => setNipGuru(e.target.value)}
                                placeholder="Kosongkan jika belum ada"
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Kurikulum */}
                <div className="card p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        Data Kurikulum
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="label label-required">Jenjang</label>
                            <select
                                value={jenjang}
                                onChange={(e) => setJenjang(e.target.value as 'SD' | 'SMP' | 'SMA')}
                                className="input select"
                            >
                                <option value="">Pilih</option>
                                {jenjangOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label label-required">Kelas</label>
                            <select
                                value={kelas || ''}
                                onChange={(e) => setKelas(parseInt(e.target.value))}
                                className="input select"
                                disabled={!jenjang}
                            >
                                <option value="">Pilih</option>
                                {availableClasses.map(k => (
                                    <option key={k} value={k}>Kelas {k}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label label-required">Semester</label>
                            <select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value as '1' | '2')}
                                className="input select"
                            >
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Fase</label>
                            <input
                                type="text"
                                value={phaseLabel || '-'}
                                className="input bg-gray-50"
                                disabled
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-4">
                            <label className="label label-required">Mata Pelajaran</label>
                            <select
                                value={mapel}
                                onChange={(e) => setMapel(e.target.value)}
                                className="input select"
                                disabled={availableSubjects.length === 0}
                            >
                                <option value="">
                                    {availableSubjects.length > 0
                                        ? `Pilih dari ${availableSubjects.length} mapel tersedia`
                                        : 'Pilih jenjang & kelas dahulu'}
                                </option>
                                {availableSubjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pengaturan Pertemuan */}
                <div className="card p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Pengaturan Pertemuan
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="label label-required">Alokasi Waktu</label>
                            <select
                                value={alokasiWaktu}
                                onChange={(e) => setAlokasiWaktu(e.target.value)}
                                className="input select"
                            >
                                {ALOKASI_WAKTU.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label label-required">Jumlah Pertemuan</label>
                            <select
                                value={jumlahPertemuan}
                                onChange={(e) => setJumlahPertemuan(e.target.value)}
                                className="input select"
                            >
                                {[1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label label-required">Model Pembelajaran</label>
                            <select
                                value={modelPembelajaran}
                                onChange={(e) => setModelPembelajaran(e.target.value)}
                                className="input select"
                            >
                                {MODEL_PEMBELAJARAN.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Materi */}
                <div className="card p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        Materi Pembelajaran
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label label-required">Topik Utama</label>
                            <input
                                type="text"
                                value={topikMateri}
                                onChange={(e) => setTopikMateri(e.target.value)}
                                placeholder="Contoh: Operasi Hitung Bilangan Pecahan"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Detail Materi (Penting)</label>
                            <textarea
                                value={detailMateri}
                                onChange={(e) => setDetailMateri(e.target.value)}
                                placeholder="Tuliskan sub-topik atau poin-poin materi yang harus dicakup:&#10;- Mengidentifikasi pecahan&#10;- Membandingkan pecahan&#10;- Operasi penjumlahan pecahan"
                                className="input min-h-[120px] resize-none"
                                rows={5}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                AI akan generate berdasarkan detail ini (100% sesuai input)
                            </p>
                        </div>
                        <div>
                            <label className="label">Kondisi Awal Murid <span className="text-gray-400">(opsional)</span></label>
                            <textarea
                                value={kondisiAwalMurid}
                                onChange={(e) => setKondisiAwalMurid(e.target.value)}
                                placeholder="Contoh: Murid sudah memahami konsep pecahan sederhana, namun kesulitan dengan pecahan campuran"
                                className="input min-h-[80px] resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn btn-primary btn-lg w-full"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menghasilkan RPPM...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate RPPM Sekarang
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-gray-400">
                    🔒 Data tidak disimpan. Generate → Download → Selesai
                </p>
            </div>

            {/* RIGHT PANEL - Preview Info (1/3 width) */}
            <div className="hidden lg:block">
                <div className="card p-6 sticky top-24">
                    <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-500" />
                        Preview Pengaturan
                    </h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Sekolah</span>
                            <span className="font-medium text-gray-800">{namaSekolah || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Kelas</span>
                            <span className="font-medium text-gray-800">
                                {jenjang && kelas ? `${jenjang} Kelas ${kelas}` : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Semester</span>
                            <span className="font-medium text-gray-800">{semester}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Penyusun</span>
                            <span className="font-medium text-gray-800">{namaGuru || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Mata Pelajaran</span>
                            <span className="font-medium text-gray-800">{mapel || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Alokasi Waktu</span>
                            <span className="font-medium text-gray-800">{alokasiWaktu}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Pertemuan</span>
                            <span className="font-medium text-gray-800">{jumlahPertemuan}x</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Model</span>
                            <span className="font-medium text-gray-800">
                                {MODEL_PEMBELAJARAN.find(m => m.value === modelPembelajaran)?.label.split(' ')[0]}
                            </span>
                        </div>
                        <div className="pt-2">
                            <span className="text-gray-500">Topik</span>
                            <p className="font-medium text-gray-800 mt-1">{topikMateri || '-'}</p>
                        </div>
                    </div>

                    {phaseLabel && (
                        <div className="mt-6 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700 font-medium">{phaseLabel}</p>
                            <p className="text-xs text-green-600 mt-1">
                                CP SK 046/2025 akan digunakan sebagai acuan
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
