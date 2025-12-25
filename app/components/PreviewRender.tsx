'use client';

import {
    AlertTriangle, ArrowLeft, Download, FileText,
    Printer, Share2, Sparkles, CheckCircle2
} from 'lucide-react';

interface PreviewRenderProps {
    rppm: {
        fullHtml: string;
        generatedAt: string;
    };
    onBack: () => void;
}

export default function PreviewRender({ rppm, onBack }: PreviewRenderProps) {
    if (!rppm || !rppm.fullHtml) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold">Gagal memuat preview</h2>
                <button onClick={onBack} className="mt-4 text-blue-600 font-medium hover:underline">
                    Kembali ke Input
                </button>
            </div>
        );
    }

    return (
        // FIXED: Wider container (max-w-6xl = 1152px) and centered
        <div className="max-w-6xl mx-auto px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-lg sticky top-6 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-2.5 text-gray-600 font-semibold hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Edit Input
                </button>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                        <CheckCircle2 className="w-4 h-4" />
                        RPPM Siap!
                    </div>
                </div>
            </div>

            {/* Privacy Alert */}
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-amber-900 font-bold text-sm">PENTING: Jangan Refresh Halaman!</p>
                    <p className="text-amber-800 text-sm opacity-80">
                        Data ini TIDAK disimpan di server kami demi keamanan privasi Anda. Silakan ekspor ke DOCX atau PDF sekarang juga agar tidak hilang.
                    </p>
                </div>
            </div>

            {/* Document Container - FIXED: Proper overflow control */}
            <div className="relative group">
                {/* Decorative gradients */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[2.5rem] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                <div
                    id="rppm-document"
                    className="relative bg-white p-8 sm:p-12 md:p-16 rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
                >
                    {/* FIXED: Comprehensive table and layout styles */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        /* ===== BASE CONTAINER ===== */
                        #rppm-document {
                            font-family: 'Times New Roman', Times, serif;
                            color: #1a1a1a;
                            line-height: 1.8;
                            max-width: 100%;
                            overflow-x: hidden; /* CRITICAL: Prevent horizontal overflow */
                        }
                        
                        #rppm-document .html-content {
                            max-width: 100%;
                            overflow-x: auto; /* Allow scroll if absolutely needed */
                        }
                        
                        /* ===== HEADINGS ===== */
                        #rppm-document h1 {
                            font-size: 20pt;
                            color: #000;
                            text-align: center;
                            margin-bottom: 16pt;
                            font-weight: bold;
                        }
                        
                        #rppm-document h2 {
                            font-size: 14pt;
                            color: #000;
                            font-weight: bold;
                            margin-top: 28pt;
                            margin-bottom: 14pt;
                            padding-bottom: 8pt;
                            border-bottom: 2pt solid #000;
                        }
                        
                        #rppm-document h3 {
                            font-size: 12pt;
                            font-weight: bold;
                            margin-top: 20pt;
                            margin-bottom: 10pt;
                        }
                        
                        #rppm-document p, 
                        #rppm-document li {
                            font-size: 11pt;
                            margin-bottom: 8pt;
                        }
                        
                        /* ===== TABLES - RESPONSIVE FIX ===== */
                        #rppm-document table {
                            width: 100% !important; /* CRITICAL: Force 100% width */
                            max-width: 100% !important;
                            border-collapse: collapse;
                            margin: 12pt 0 16pt 0;
                            table-layout: fixed !important; /* CRITICAL: Fixed layout prevents overflow */
                            word-wrap: break-word; /* Wrap long words */
                            overflow-wrap: break-word;
                        }
                        
                        #rppm-document table td,
                        #rppm-document table th {
                            border: 1px solid #000;
                            padding: 8pt;
                            vertical-align: top;
                            font-size: 10pt;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            hyphens: auto;
                        }
                        
                        #rppm-document table th {
                            background-color: #fef9c3;
                            font-weight: bold;
                            text-align: center;
                        }
                        
                        /* Remove any inline width styles from tables */
                        #rppm-document table[style*="width"] {
                            width: 100% !important;
                        }
                        
                        #rppm-document table td[style*="width"],
                        #rppm-document table th[style*="width"] {
                            width: auto !important;
                        }
                        
                        /* ===== BLOCKQUOTES ===== */
                        #rppm-document blockquote {
                            border-left: 4pt solid #2563eb;
                            padding: 12pt 16pt;
                            margin: 16pt 0;
                            font-style: italic;
                            background: #f8fafc;
                        }
                        
                        /* ===== LISTS ===== */
                        #rppm-document ol, 
                        #rppm-document ul {
                            margin-left: 20px;
                            margin-bottom: 12pt;
                            padding-left: 8px;
                        }
                        
                        #rppm-document li {
                            margin-bottom: 6pt;
                        }
                        
                        /* ===== SIGNATURE BLOCK ===== */
                        #rppm-document table:last-of-type {
                            margin-top: 40pt;
                        }
                        
                        #rppm-document table:last-of-type td {
                            border: none !important;
                            padding: 16pt;
                            text-align: center;
                            line-height: 2;
                        }
                    `}} />

                    <div
                        dangerouslySetInnerHTML={{ __html: rppm.fullHtml }}
                        className="html-content"
                    />
                </div>
            </div>

            {/* Bottom Note */}
            <div className="text-center pb-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-500 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Dihasilkan pada: {new Date(rppm.generatedAt).toLocaleString('id-ID')}
                </div>
            </div>
        </div>
    );
}
