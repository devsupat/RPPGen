'use client';

import { useState, useEffect } from 'react';
import { X, Key, Check, Trash2, ExternalLink } from 'lucide-react';

const LOCALSTORAGE_KEY = 'groq_user_api_key';

interface ApiSettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function getStoredApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCALSTORAGE_KEY);
}

export function setStoredApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCALSTORAGE_KEY, key);
}

export function clearStoredApiKey(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOCALSTORAGE_KEY);
}

export function hasUserApiKey(): boolean {
    return !!getStoredApiKey();
}

export default function ApiSettingsPanel({ isOpen, onClose, onSave }: ApiSettingsPanelProps) {
    const [apiKey, setApiKey] = useState('');
    const [hasExistingKey, setHasExistingKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const existingKey = getStoredApiKey();
            setHasExistingKey(!!existingKey);
            setApiKey(existingKey || '');
            setSaved(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKey.trim()) {
            setStoredApiKey(apiKey.trim());
            setHasExistingKey(true);
            setSaved(true);
            setTimeout(() => {
                onSave();
                onClose();
            }, 1000);
        }
    };

    const handleClear = () => {
        clearStoredApiKey();
        setApiKey('');
        setHasExistingKey(false);
    };

    const handleTutorial = () => {
        window.open('https://www.youtube.com/watch?v=Me7u7fq9kJ4', '_blank');
    };

    const isValidFormat = apiKey.startsWith('gsk_') && apiKey.length > 20;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-blue-600" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Pengaturan API
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Masukkan API key Groq pribadi Anda
                </p>

                {/* Existing key indicator */}
                {hasExistingKey && !saved && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">API key tersimpan</span>
                        <button
                            onClick={handleClear}
                            className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                            title="Hapus API key"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Saved confirmation */}
                {saved && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Tersimpan!</span>
                    </div>
                )}

                {/* Input */}
                <div className="mb-4">
                    <label className="label">Groq API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="gsk_..."
                        className="input"
                        autoComplete="off"
                    />
                    {apiKey && !isValidFormat && (
                        <p className="text-xs text-amber-600 mt-1">
                            API key Groq biasanya dimulai dengan &quot;gsk_&quot;
                        </p>
                    )}
                </div>

                {/* Tutorial link */}
                <button
                    onClick={handleTutorial}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6"
                >
                    <ExternalLink className="w-3 h-3" />
                    Cara mendapatkan API key gratis
                </button>

                {/* Save button */}
                <button
                    onClick={handleSave}
                    disabled={!apiKey.trim() || saved}
                    className="btn btn-primary w-full"
                >
                    {saved ? (
                        <>
                            <Check className="w-4 h-4" />
                            Tersimpan
                        </>
                    ) : (
                        <>
                            <Key className="w-4 h-4" />
                            Simpan API Key
                        </>
                    )}
                </button>

                {/* Privacy note */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    🔒 API key disimpan hanya di perangkat ini (localStorage).
                    <br />
                    Tidak pernah dikirim ke server kami.
                </p>
            </div>
        </div>
    );
}
