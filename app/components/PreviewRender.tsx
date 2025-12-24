'use client';

import {
    School, User, BookOpen, GraduationCap, Target,
    Lightbulb, Layers, ClipboardList, AlertTriangle,
    ExternalLink, Play, Globe, Sparkles
} from 'lucide-react';

interface PreviewRenderProps {
    rppm: Record<string, unknown>;
    onBack: () => void;
}

// Helper functions for safe data access
function get(obj: Record<string, unknown>, path: string, defaultValue = ''): string {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return defaultValue;
        }
    }
    return result !== undefined && result !== null ? String(result) : defaultValue;
}

function getArray(obj: Record<string, unknown>, path: string): unknown[] {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return [];
        }
    }
    return Array.isArray(result) ? result : [];
}

function getObject(obj: Record<string, unknown>, path: string): Record<string, unknown> {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return {};
        }
    }
    return typeof result === 'object' && result !== null ? result as Record<string, unknown> : {};
}

export default function PreviewRender({ rppm, onBack }: PreviewRenderProps) {
    // Extract data safely
    const kepsek = getObject(rppm, 'kepsek');
    const guru = getObject(rppm, 'guru');
    const identifikasi = getObject(rppm, 'identifikasi');
    const desain = getObject(rppm, 'desainPembelajaran');
    const deepLearning = getObject(desain, 'pendekatanDeepLearning');
    const pengalaman = getObject(rppm, 'pengalamanBelajar');
    const asesmen = getObject(rppm, 'asesmen');
    const capaian = getObject(rppm, 'capaianPembelajaran');

    const dimensiProfil = getArray(identifikasi, 'dimensiProfilLulusan').map(d => String(d));
    const tujuanPembelajaran = getArray(desain, 'tujuanPembelajaran').map(t => String(t));
    const metode = getArray(desain, 'metode').map(m => String(m));
    const media = getArray(desain, 'media').map(m => String(m));
    const pemanfaatanDigital = getArray(desain, 'pemanfaatanDigital').map(d => String(d));
    const pendahuluan = getArray(pengalaman, 'pendahuluan');
    const kegiatanInti = getArray(pengalaman, 'kegiatan_inti');
    const penutup = getArray(pengalaman, 'penutup');
    const rubrikPenilaian = getArray(rppm, 'rubrikPenilaian');

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Privacy Banner */}
            <div className="privacy-banner mb-6">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                    ⚠️ Data tidak disimpan di server. Unduh dokumen sekarang sebelum menutup halaman ini.
                </span>
            </div>

            {/* Back Button */}
            <button onClick={onBack} className="btn btn-secondary mb-6">
                ← Buat RPPM Baru
            </button>

            {/* RPPM Document */}
            <div id="rppm-preview" className="card p-6 sm:p-8 space-y-8">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {get(rppm, 'judul', 'Rencana Pembelajaran Mendalam')}
                    </h1>
                    <p className="text-gray-600">Kurikulum Merdeka · Deep Learning Approach</p>
                </div>

                {/* Informasi Identitas */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <School className="w-5 h-5 text-blue-500" />
                        Informasi Identitas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <InfoItem label="Satuan Pendidikan" value={get(rppm, 'sekolah')} />
                        <InfoItem label="Kepala Sekolah" value={`${get(kepsek, 'nama')} (NIP: ${get(kepsek, 'nip')})`} />
                        <InfoItem label="Guru Pengajar" value={`${get(guru, 'nama')}${get(guru, 'nip') ? ` (NIP: ${get(guru, 'nip')})` : ''}`} />
                        <InfoItem label="Fase / Kelas" value={`${get(rppm, 'fase')} - ${get(rppm, 'kelas')}`} />
                        <InfoItem label="Mata Pelajaran" value={get(rppm, 'mapel')} />
                        <InfoItem label="Topik/Materi" value={get(rppm, 'topik')} />
                        <InfoItem label="Alokasi Waktu" value={get(rppm, 'alokasiWaktu', '2 x 35 menit')} />
                    </div>
                </section>

                {/* Capaian Pembelajaran */}
                {Object.keys(capaian).length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-green-500" />
                            Capaian Pembelajaran (CP)
                        </h2>
                        <div className="bg-green-50 p-4 rounded-lg space-y-3">
                            {Object.entries(capaian).map(([elemen, deskripsi]) => (
                                <div key={elemen}>
                                    <p className="font-medium text-green-700">{elemen}</p>
                                    <p className="text-sm text-gray-700">{String(deskripsi)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* I. Identifikasi */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-500" />
                        I. Identifikasi
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-purple-700">Identifikasi Murid</p>
                            <p className="text-gray-700 mt-1">{get(identifikasi, 'karakteristikMurid')}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-purple-700">Karakter Materi</p>
                            <p className="text-gray-700 mt-1">{get(identifikasi, 'karakterMateri')}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Dimensi Profil Pelajar Pancasila</p>
                            <div className="flex flex-wrap gap-2">
                                {dimensiProfil.map((dimensi, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {dimensi}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* II. Desain Pembelajaran */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        II. Desain Pembelajaran
                    </h2>

                    {/* Tujuan Pembelajaran */}
                    {tujuanPembelajaran.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Tujuan Pembelajaran</p>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <ul className="space-y-2">
                                    {tujuanPembelajaran.map((tujuan, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-yellow-600 font-bold">{i + 1}.</span>
                                            {tujuan}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Model & Metode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Model Pembelajaran</p>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                {get(desain, 'model', 'Problem Based Learning')}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Metode</p>
                            <div className="flex flex-wrap gap-2">
                                {metode.map((m, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pendekatan Deep Learning */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-blue-700 mb-2">🧠 Berkesadaran</p>
                            <p className="text-xs text-gray-600">{get(deepLearning, 'berkesadaran')}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-green-700 mb-2">💡 Bermakna</p>
                            <p className="text-xs text-gray-600">{get(deepLearning, 'bermakna')}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-orange-700 mb-2">🎉 Menggembirakan</p>
                            <p className="text-xs text-gray-600">{get(deepLearning, 'menggembirakan')}</p>
                        </div>
                    </div>

                    {/* Pemanfaatan Digital */}
                    {pemanfaatanDigital.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Pemanfaatan Digital
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                {pemanfaatanDigital.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                        {item.toLowerCase().includes('youtube') || item.toLowerCase().includes('video') ? (
                                            <Play className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* III. Pengalaman Belajar */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        III. Pengalaman Belajar
                    </h2>

                    <div className="space-y-4">
                        {/* Pendahuluan */}
                        <div className="border-l-4 border-blue-400 pl-4">
                            <h3 className="text-sm font-semibold text-blue-600 mb-2">📍 Pendahuluan [Berkesadaran]</h3>
                            <ul className="space-y-2">
                                {pendahuluan.map((item, i) => {
                                    const text = typeof item === 'string' ? item : get(item as Record<string, unknown>, 'deskripsi', String(item));
                                    return (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-blue-400">•</span>
                                            {text}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Kegiatan Inti */}
                        <div className="border-l-4 border-green-400 pl-4">
                            <h3 className="text-sm font-semibold text-green-600 mb-2">📚 Kegiatan Inti [Bermakna/Menggembirakan]</h3>
                            <div className="space-y-3">
                                {kegiatanInti.map((item, i) => {
                                    const obj = item as Record<string, unknown>;
                                    const deskripsi = get(obj, 'deskripsi', String(item));
                                    const label = get(obj, 'labelKompetensi', '');
                                    return (
                                        <div key={i} className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-700">{deskripsi}</p>
                                            {label && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs font-medium">
                                                    {label}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Penutup */}
                        <div className="border-l-4 border-purple-400 pl-4">
                            <h3 className="text-sm font-semibold text-purple-600 mb-2">🏁 Penutup [Merefleksi]</h3>
                            <ul className="space-y-2">
                                {penutup.map((item, i) => {
                                    const text = typeof item === 'string' ? item : get(item as Record<string, unknown>, 'deskripsi', String(item));
                                    return (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-purple-400">•</span>
                                            {text}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* IV. Asesmen */}
                {Object.keys(asesmen).length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            IV. Asesmen & Tindak Lanjut
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-amber-700 mb-1">As Learning</p>
                                <p className="text-xs text-gray-600">{get(asesmen, 'asLearning', 'Refleksi diri murid')}</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-amber-700 mb-1">For Learning</p>
                                <p className="text-xs text-gray-600">{get(asesmen, 'forLearning', 'Observasi, tanya jawab')}</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-amber-700 mb-1">Of Learning</p>
                                <p className="text-xs text-gray-600">{get(asesmen, 'ofLearning', 'Penilaian produk')}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* V. Rubrik Penilaian */}
                {rubrikPenilaian.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <ClipboardList className="w-5 h-5 text-red-500" />
                            V. Rubrik Penilaian (Taksonomi SOLO)
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Level</th>
                                        <th style={{ width: '40%' }}>Deskripsi</th>
                                        <th style={{ width: '40%' }}>Indikator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubrikPenilaian.map((rubrik, i) => {
                                        const row = rubrik as Record<string, unknown>;
                                        const level = get(row, 'level', '');
                                        return (
                                            <tr key={i}>
                                                <td>
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${level === 'Extended Abstract' ? 'bg-purple-100 text-purple-700' :
                                                            level === 'Relational' ? 'bg-blue-100 text-blue-700' :
                                                                level === 'Multistructural' ? 'bg-green-100 text-green-700' :
                                                                    level === 'Unistructural' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {level}
                                                    </span>
                                                </td>
                                                <td className="text-sm text-gray-700">{get(row, 'deskripsi')}</td>
                                                <td className="text-sm text-gray-700">{get(row, 'indikator')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                    <p>Dokumen ini dihasilkan oleh GuruPintar AI</p>
                    <p>Kurikulum Merdeka 2025 · SK 046/2025</p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium text-gray-900">{value || '-'}</p>
        </div>
    );
}
