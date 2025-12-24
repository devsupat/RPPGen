'use client';

import { useState, useEffect } from 'react';
import { Loader2, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { getDeviceFingerprint, isClient } from '@/lib/fingerprint';
import DeviceLocked from './DeviceLocked';

interface LoginFormProps {
    onLoginSuccess: (user: {
        kodeAkses: string;
        nama: string;
        sekolah: string;
        deviceHash: string;
    }) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deviceHash, setDeviceHash] = useState<string>('');
    const [isDeviceLocked, setIsDeviceLocked] = useState(false);

    useEffect(() => {
        if (isClient()) {
            getDeviceFingerprint().then(hash => {
                setDeviceHash(hash);
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!accessCode.trim()) {
            setError('Masukkan kode akses Anda');
            return;
        }

        if (!deviceHash) {
            setError('Menunggu identifikasi perangkat...');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessCode: accessCode.trim(),
                    deviceHash
                })
            });

            const data = await response.json();

            if (data.success) {
                onLoginSuccess(data.user);
            } else {
                if (data.errorCode === 'DEVICE_LOCKED') {
                    setIsDeviceLocked(true);
                } else {
                    setError(data.error || 'Login gagal');
                }
            }
        } catch {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackFromLocked = () => {
        setIsDeviceLocked(false);
        setAccessCode('');
        setError(null);
    };

    if (isDeviceLocked) {
        return <DeviceLocked onBack={handleBackFromLocked} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
            {/* Container with max width */}
            <div className="w-full max-w-[420px]">

                {/* ===== BRANDING SECTION ===== */}
                <div className="text-center mb-10 sm:mb-12">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 mb-6 shadow-2xl shadow-blue-500/25">
                        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        GuruPintar AI
                    </h1>

                    {/* Subtitle - separated with good spacing */}
                    <p className="text-gray-500 text-sm sm:text-base mt-2">
                        Generator RPPM Deep Learning
                    </p>

                    {/* Badge */}
                    <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                            Kurikulum Merdeka 2025 · SK 046/2025
                        </span>
                    </div>
                </div>

                {/* ===== LOGIN CARD ===== */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
                    <form onSubmit={handleSubmit}>

                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* ===== INPUT GROUP ===== */}
                        <div className="space-y-2 mb-8">
                            {/* Label */}
                            <label
                                htmlFor="accessCode"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Kode Akses
                            </label>

                            {/* Input Container */}
                            <div className="relative">
                                <input
                                    type="text"
                                    id="accessCode"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    placeholder="GP-XXXX-XX"
                                    className="
                                        w-full h-14 px-6
                                        text-base font-semibold tracking-widest
                                        bg-white border-2 border-gray-200
                                        rounded-2xl
                                        placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal
                                        focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                                        transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                    disabled={isLoading}
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>

                            {/* Helper Text - clearly separated */}
                            <p className="text-xs text-gray-400 pt-1 pl-1">
                                Kode akses diberikan oleh administrator sekolah Anda
                            </p>
                        </div>

                        {/* ===== SUBMIT BUTTON ===== */}
                        <button
                            type="submit"
                            disabled={isLoading || !deviceHash}
                            className="
                                w-full h-14
                                flex items-center justify-center gap-2.5
                                bg-gradient-to-r from-blue-600 to-indigo-600
                                hover:from-blue-700 hover:to-indigo-700
                                text-white font-semibold text-base
                                rounded-xl
                                shadow-lg shadow-blue-500/25
                                hover:shadow-xl hover:shadow-blue-500/30
                                transform hover:-translate-y-0.5
                                transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                            "
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memverifikasi...</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound className="w-5 h-5" />
                                    <span>Masuk ke Sistem</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* ===== FOOTER NOTE ===== */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                            <p className="text-xs">
                                Akun akan terkunci ke perangkat ini
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM FOOTER ===== */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        © 2025 GuruPintar AI · Privasi Terjaga
                    </p>
                </div>
            </div>
        </div>
    );
}
