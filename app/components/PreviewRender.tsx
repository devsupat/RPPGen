'use client';

import {
    School, User, BookOpen, GraduationCap, Target,
    Lightbulb, Layers, ClipboardList, AlertTriangle
} from 'lucide-react';

interface PreviewRenderProps {
    rppm: Record<string, unknown>;
    onBack: () => void;
}

export default function PreviewRender({ rppm, onBack }: PreviewRenderProps) {
    // Type-safe accessors
    const judul = rppm.judul as string || 'Rencana Pembelajaran Mendalam';
    const sekolah = rppm.sekolah as string || '';
    const kepsek = rppm.kepsek as { nama: string; nip: string } || { nama: '', nip: '' };
    const guru = rppm.guru as { nama: string; nip?: string } || { nama: '', nip: '' };
    const mapel = rppm.mapel as string || '';
    const kelas = rppm.kelas as string || '';
    const fase = rppm.fase as string || '';
    const topik = rppm.topik as string || '';

    const identifikasi = rppm.identifikasi as {
        karakteristikMurid: string;
        karakterMateri: string;
        dimensiProfilLulusan: string[];
    } || { karakteristikMurid: '', karakterMateri: '', dimensiProfilLulusan: [] };

    const desainPembelajaran = rppm.desainPembelajaran as {
        model: string;
        pendekatanDeepLearning: {
            berkesadaran: string;
            bermakna: string;
            menggembirakan: string;
        };
        pemanfaatanDigital: string[];
    } || { model: '', pendekatanDeepLearning: { berkesadaran: '', bermakna: '', menggembirakan: '' }, pemanfaatanDigital: [] };

    const pengalamanBelajar = rppm.pengalamanBelajar as {
        pendahuluan: string[];
        kegiatan_inti: { deskripsi: string; labelKompetensi: string }[];
        penutup: string[];
    } || { pendahuluan: [], kegiatan_inti: [], penutup: [] };

    const rubrikPenilaian = rppm.rubrikPenilaian as {
        level: string;
        deskripsi: string;
        indikator: string;
    }[] || [];

    const capaianPembelajaran = rppm.capaianPembelajaran as Record<string, string> || {};

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in">
            {/* Privacy Banner */}
            <div className="privacy-banner mb-6">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                    ⚠️ Data tidak disimpan di server. Unduh dokumen sekarang sebelum menutup halaman ini.
                </span>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="btn btn-secondary mb-6"
            >
                ← Buat RPPM Baru
            </button>

            {/* RPPM Document */}
            <div id="rppm-preview" className="card p-8 space-y-8">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{judul}</h1>
                    <p className="text-gray-600">Kurikulum Merdeka · Deep Learning Approach</p>
                </div>

                {/* Identity Section */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <School className="w-5 h-5 text-blue-500" />
                        Informasi Umum
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500">Sekolah</p>
                            <p className="font-medium">{sekolah}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Kepala Sekolah</p>
                            <p className="font-medium">{kepsek.nama}</p>
                            <p className="text-sm text-gray-500">NIP: {kepsek.nip}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Guru Pengajar</p>
                            <p className="font-medium">{guru.nama}</p>
                            {guru.nip && <p className="text-sm text-gray-500">NIP: {guru.nip}</p>}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Kelas / Fase</p>
                            <p className="font-medium">{kelas}</p>
                            <p className="text-sm text-gray-500">{fase}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Mata Pelajaran</p>
                            <p className="font-medium">{mapel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Topik</p>
                            <p className="font-medium">{topik}</p>
                        </div>
                    </div>
                </section>

                {/* Capaian Pembelajaran */}
                {Object.keys(capaianPembelajaran).length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-green-500" />
                            Capaian Pembelajaran (CP)
                        </h2>
                        <div className="bg-green-50 p-4 rounded-lg space-y-3">
                            {Object.entries(capaianPembelajaran).map(([elemen, deskripsi]) => (
                                <div key={elemen}>
                                    <p className="font-medium text-green-700">{elemen}</p>
                                    <p className="text-sm text-gray-700">{deskripsi}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Identifikasi */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-500" />
                        Identifikasi
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-purple-700">Karakteristik Murid</p>
                            <p className="text-gray-700 mt-1">{identifikasi.karakteristikMurid}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-purple-700">Karakter Materi</p>
                            <p className="text-gray-700 mt-1">{identifikasi.karakterMateri}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Dimensi Profil Pelajar Pancasila</p>
                            <div className="flex flex-wrap gap-2">
                                {identifikasi.dimensiProfilLulusan.map((dimensi, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {dimensi}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Desain Pembelajaran */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Desain Pembelajaran
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                Model: {desainPembelajaran.model}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-blue-700">🧠 Berkesadaran</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {desainPembelajaran.pendekatanDeepLearning.berkesadaran}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-green-700">💡 Bermakna</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {desainPembelajaran.pendekatanDeepLearning.bermakna}
                                </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-orange-700">🎉 Menggembirakan</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {desainPembelajaran.pendekatanDeepLearning.menggembirakan}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Pemanfaatan Digital</p>
                            <div className="flex flex-wrap gap-2">
                                {desainPembelajaran.pemanfaatanDigital.map((tool, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pengalaman Belajar */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        Pengalaman Belajar
                    </h2>

                    <div className="space-y-4">
                        {/* Pendahuluan */}
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-600 mb-2">📍 Pendahuluan</h3>
                            <ul className="space-y-2">
                                {pengalamanBelajar.pendahuluan.map((item, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <span className="text-indigo-400">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kegiatan Inti */}
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-600 mb-2">📚 Kegiatan Inti</h3>
                            <div className="space-y-3">
                                {pengalamanBelajar.kegiatan_inti.map((item, i) => (
                                    <div key={i} className="bg-indigo-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-700">{item.deskripsi}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs font-medium">
                                            {item.labelKompetensi}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Penutup */}
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-600 mb-2">🏁 Penutup</h3>
                            <ul className="space-y-2">
                                {pengalamanBelajar.penutup.map((item, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <span className="text-indigo-400">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Rubrik Penilaian - Taksonomi SOLO */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <ClipboardList className="w-5 h-5 text-red-500" />
                        Rubrik Penilaian (Taksonomi SOLO)
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
                                {rubrikPenilaian.map((rubrik, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${rubrik.level === 'Extended Abstract' ? 'bg-purple-100 text-purple-700' :
                                                    rubrik.level === 'Relational' ? 'bg-blue-100 text-blue-700' :
                                                        rubrik.level === 'Multistructural' ? 'bg-green-100 text-green-700' :
                                                            rubrik.level === 'Unistructural' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                }`}>
                                                {rubrik.level}
                                            </span>
                                        </td>
                                        <td className="text-sm text-gray-700">{rubrik.deskripsi}</td>
                                        <td className="text-sm text-gray-700">{rubrik.indikator}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                    <p>Dokumen ini dihasilkan oleh GuruPintar AI</p>
                    <p>Kurikulum Merdeka 2025 · SK 046/2025</p>
                </div>
            </div>
        </div>
    );
}
