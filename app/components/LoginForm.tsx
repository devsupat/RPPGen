'use client';

import { useState, useEffect } from 'react';
import { Loader2, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { getDeviceFingerprint, isClient } from '@/lib/fingerprint';

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

    // Get device fingerprint on mount
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
                setError(data.error || 'Login gagal');
            }
        } catch {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-5 shadow-xl">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        GuruPintar AI
                    </h1>
                    <p className="text-neutral-500 text-base">
                        Generator RPPM Deep Learning
                    </p>
                    <p className="text-neutral-400 text-sm mt-1">
                        Kurikulum Merdeka 2025
                    </p>
                </div>

                {/* Login Card */}
                <div className="card-elevated p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error mb-6 animate-fade-in">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Access Code Input */}
                        <div className="form-group mb-6">
                            <label htmlFor="accessCode" className="label">
                                Kode Akses
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    id="accessCode"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Masukkan kode akses Anda"
                                    className="input pl-12 text-base"
                                    disabled={isLoading}
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                            <p className="form-hint">
                                Kode akses diberikan oleh administrator sekolah
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !deviceHash}
                            className="btn btn-primary btn-lg w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memverifikasi...
                                </>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    {/* Device Lock Notice */}
                    <div className="mt-8 pt-6 border-t border-neutral-100">
                        <p className="text-xs text-neutral-400 text-center leading-relaxed">
                            🔒 Untuk keamanan, akun Anda akan terkunci ke perangkat ini setelah login pertama.
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <p className="text-center text-xs text-neutral-400 mt-8">
                    © 2025 GuruPintar AI · Privasi Terlindungi
                </p>
            </div>
        </div>
    );
}
