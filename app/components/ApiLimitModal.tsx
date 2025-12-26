'use client';

import { X, ExternalLink, Key } from 'lucide-react';

interface ApiLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
}

export default function ApiLimitModal({ isOpen, onClose, onOpenSettings }: ApiLimitModalProps) {
    if (!isOpen) return null;

    const handleTutorial = () => {
        window.open('https://www.youtube.com/watch?v=jalKNhtVcBQ', '_blank');
    };

    const handleOpenSettings = () => {
        onClose();
        onOpenSettings();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
                    API Terbatas
                </h2>

                {/* Message */}
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    Layanan sementara mencapai batas pemakaian.
                    <br />
                    <span className="text-gray-500 text-sm">
                        Agar tetap bisa menggunakan aplikasi, silakan masukkan API Groq pribadi Anda.
                    </span>
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleOpenSettings}
                        className="btn btn-primary w-full"
                    >
                        <Key className="w-4 h-4" />
                        Masukkan API
                    </button>

                    <button
                        onClick={handleTutorial}
                        className="btn btn-secondary w-full"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Lihat Tutorial
                    </button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    API key Anda disimpan di perangkat ini saja dan tidak dikirim ke server kami.
                </p>
            </div>
        </div>
    );
}
