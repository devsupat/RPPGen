'use client';

import { ShieldAlert, Mail, ArrowLeft, Smartphone } from 'lucide-react';

interface DeviceLockedProps {
    onBack: () => void;
}

export default function DeviceLocked({ onBack }: DeviceLockedProps) {
    const handleRequestReset = () => {
        const email = 'bdrtiksupat@gmail.com';
        const subject = encodeURIComponent('Permohonan Reset Akun GuruPintar AI');
        const body = encodeURIComponent(
            `Halo Admin,

Saya tidak dapat login karena akun saya terkunci di perangkat lain.
Mohon bantu lakukan reset akun saya.

Terima kasih.`
        );

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-orange-50 to-white">
            <div className="w-full max-w-md">
                {/* Icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                        <ShieldAlert className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Akun Terkunci
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        <Smartphone className="w-4 h-4" />
                        Terdeteksi perangkat berbeda
                    </div>
                </div>

                {/* Card */}
                <div className="card p-6 space-y-6">
                    {/* Main Message */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-gray-800 text-center leading-relaxed">
                            Akun ini sedang digunakan di <strong>perangkat atau browser lain</strong>.
                        </p>
                        <p className="text-gray-600 text-sm text-center mt-2">
                            Silakan login kembali menggunakan perangkat dan browser sebelumnya.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400 uppercase">atau</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Secondary Message */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            Jika Anda <span className="font-medium">berganti perangkat atau browser</span>,
                            Anda perlu meminta reset akun kepada admin.
                        </p>

                        {/* Reset Button */}
                        <button
                            onClick={handleRequestReset}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            Minta Reset Akun
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                            Akan membuka aplikasi email Anda
                        </p>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Login
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    🔒 Fitur ini melindungi akun Anda dari penggunaan tidak sah
                </p>
            </div>
        </div>
    );
}
