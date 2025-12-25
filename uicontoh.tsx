'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Clock, Users, BookOpen, FileText, Target, Settings, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

// Mock data functions for demo
const getJenjangOptions = () => [
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA', label: 'SMA' }
];

const getClassesByJenjang = (jenjang: string) => {
  if (jenjang === 'SD') return [1, 2, 3, 4, 5, 6];
  if (jenjang === 'SMP') return [7, 8, 9];
  if (jenjang === 'SMA') return [10, 11, 12];
  return [];
};

const getPhaseByClass = (jenjang: string, kelas: number) => {
  if (kelas <= 2) return 'A';
  if (kelas <= 4) return 'B';
  if (kelas <= 6) return 'C';
  if (kelas <= 9) return 'D';
  return 'E';
};

const getSubjectsByPhase = (phase: string) => [
  'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'
];

const getPhaseLabel = (phase: string) => `Fase ${phase}`;

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

export default function WizardForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Identity fields
  const [namaSekolah, setNamaSekolah] = useState('');
  const [namaKepsek, setNamaKepsek] = useState('');
  const [nipKepsek, setNipKepsek] = useState('');
  const [namaGuru, setNamaGuru] = useState('');
  const [nipGuru, setNipGuru] = useState('');
  const [kota, setKota] = useState('Tangerang');
  const [tanggalKeabsahan, setTanggalKeabsahan] = useState(new Date().toISOString().split('T')[0]);

  // Curriculum fields
  const [jenjang, setJenjang] = useState<'SD' | 'SMP' | 'SMA' | ''>('');
  const [kelas, setKelas] = useState<number>(0);
  const [fase, setFase] = useState<string>('');
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

  // Check section completion
  useEffect(() => {
    const completed = new Set<string>();
    
    if (namaSekolah && namaKepsek && nipKepsek && namaGuru) {
      completed.add('identity');
    }
    if (jenjang && kelas && mapel) {
      completed.add('curriculum');
    }
    if (topikMateri) {
      completed.add('material');
    }
    
    setCompletedSections(completed);
  }, [namaSekolah, namaKepsek, nipKepsek, namaGuru, jenjang, kelas, mapel, topikMateri]);

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

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      alert('RPPM Generated! (Demo mode)');
    }, 2000);
  };

  const jenjangOptions = getJenjangOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT PANEL - Form Input */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Generator RPPM
                  </h1>
                  <p className="text-base text-gray-600 mb-3">
                    Rencana Pelaksanaan Pembelajaran dengan Deep Learning
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                      Kurikulum Merdeka
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">SK 046/2025</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Perhatian</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Data Sekolah */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Data Sekolah & Guru</h3>
                      <p className="text-sm text-blue-100">Informasi identitas sekolah dan penyusun</p>
                    </div>
                  </div>
                  {completedSections.has('identity') && (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaSekolah}
                      onChange={(e) => setNamaSekolah(e.target.value)}
                      placeholder="Contoh: SDN 01 Menteng"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Kepala Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaKepsek}
                      onChange={(e) => setNamaKepsek(e.target.value)}
                      placeholder="Nama lengkap dengan gelar"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIP Kepala Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nipKepsek}
                      onChange={(e) => setNipKepsek(e.target.value)}
                      placeholder="18 digit NIP"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Guru Penyusun <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaGuru}
                      onChange={(e) => setNamaGuru(e.target.value)}
                      placeholder="Nama lengkap dengan gelar"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIP Guru <span className="text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={nipGuru}
                      onChange={(e) => setNipGuru(e.target.value)}
                      placeholder="Kosongkan jika belum ada"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kota Administrasi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={kota}
                        onChange={(e) => setKota(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Keabsahan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={tanggalKeabsahan}
                        onChange={(e) => setTanggalKeabsahan(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Kurikulum */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Data Kurikulum</h3>
                      <p className="text-sm text-green-100">Jenjang, kelas, fase, dan mata pelajaran</p>
                    </div>
                  </div>
                  {completedSections.has('curriculum') && (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenjang <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jenjang}
                      onChange={(e) => setJenjang(e.target.value as 'SD' | 'SMP' | 'SMA')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="">Pilih</option>
                      {jenjangOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.value}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={kelas || ''}
                      onChange={(e) => setKelas(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!jenjang}
                    >
                      <option value="">Pilih</option>
                      {availableClasses.map(k => (
                        <option key={k} value={k}>Kelas {k}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value as '1' | '2')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fase
                    </label>
                    <input
                      type="text"
                      value={phaseLabel || '-'}
                      className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-gray-900 font-medium"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Section 3: Pengaturan Pertemuan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Pengaturan Pertemuan</h3>
                    <p className="text-sm text-orange-100">Alokasi waktu dan model pembelajaran</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alokasi Waktu <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={alokasiWaktu}
                      onChange={(e) => setAlokasiWaktu(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
                    >
                      {ALOKASI_WAKTU.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jumlah Pertemuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jumlahPertemuan}
                      onChange={(e) => setJumlahPertemuan(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} Pertemuan</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Model Pembelajaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={modelPembelajaran}
                      onChange={(e) => setModelPembelajaran(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
                    >
                      {MODEL_PEMBELAJARAN.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Materi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Materi Pembelajaran</h3>
                      <p className="text-sm text-purple-100">Topik, detail materi, dan kondisi awal murid</p>
                    </div>
                  </div>
                  {completedSections.has('material') && (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topik Utama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topikMateri}
                    onChange={(e) => setTopikMateri(e.target.value)}
                    placeholder="Contoh: Operasi Hitung Bilangan Pecahan"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Detail Materi <span className="text-gray-400 font-normal">(Penting untuk hasil optimal)</span>
                  </label>
                  <textarea
                    value={detailMateri}
                    onChange={(e) => setDetailMateri(e.target.value)}
                    placeholder="Tuliskan sub-topik atau poin-poin materi yang harus dicakup..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                    rows={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kondisi Awal Murid <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <textarea
                    value={kondisiAwalMurid}
                    onChange={(e) => setKondisiAwalMurid(e.target.value)}
                    placeholder="Contoh: Murid sudah memahami konsep pecahan sederhana..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg">Menghasilkan RPPM...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span className="text-lg">Generate RPPM Sekarang</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Data tidak disimpan • Generate → Download → Selesai</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Preview */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Preview Pengaturan</h3>
                      <p className="text-sm text-indigo-100">Ringkasan data yang akan digunakan</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Sekolah</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {namaSekolah || <span className="text-gray-400">-</span>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Kepala Sekolah</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {namaKepsek || <span className="text-gray-400">-</span>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Guru Penyusun</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {namaGuru || <span className="text-gray-400">-</span>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Kelas</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {jenjang && kelas ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-50 text-green-700">
                          {jenjang} Kelas {kelas}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Semester</span>
                    <span className="text-sm font-semibold text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700">
                        Semester {semester}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Mata Pelajaran</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {mapel || <span className="text-gray-400">-</span>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Topik Materi</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {topikMateri || <span className="text-gray-400">-</span>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Alokasi Waktu</span>
                    <span className="text-sm font-semibold text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 text-orange-700">
                        {alokasiWaktu}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-3">
                    <span className="text-sm font-medium text-gray-500">Model Pembelajaran</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {MODEL_PEMBELAJARAN.find(m => m.value === modelPembelajaran)?.label || '-'}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 px-8 py-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {completedSections.size}/3 Bagian Lengkap
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {completedSections.size === 3 
                          ? 'Siap untuk generate RPPM!' 
                          : 'Lengkapi form untuk melanjutkan'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}