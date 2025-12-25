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
                    {/* FIXED: Match DOCX table styling exactly */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        /* ===== BASE CONTAINER ===== */
                        #rppm-document {
                            font-family: 'Times New Roman', Times, serif;
                            color: #1a1a1a;
                            line-height: 1.8;
                            max-width: 100%;
                            overflow-x: hidden;
                        }
                        
                        #rppm-document .html-content {
                            max-width: 100%;
                            overflow-x: auto;
                        }
                        
                        /* ===== HEADINGS ===== */
                        #rppm-document h1 {
                            font-size: 18pt;
                            color: #000;
                            text-align: center;
                            margin-bottom: 18pt;
                            font-weight: bold;
                            letter-spacing: 0.5pt;
                        }
                        
                        #rppm-document h2 {
                            font-size: 14pt;
                            color: #000;
                            font-weight: bold;
                            margin-top: 30pt;
                            margin-bottom: 16pt;
                            padding-bottom: 10pt;
                            border-bottom: 2pt solid #000;
                        }
                        
                        #rppm-document h3 {
                            font-size: 12pt;
                            font-weight: bold;
                            margin-top: 22pt;
                            margin-bottom: 12pt;
                        }
                        
                        #rppm-document p, 
                        #rppm-document li {
                            font-size: 11pt;
                            margin-bottom: 8pt;
                        }
                        
                        /* ===== TABLES - MATCH DOCX EXACTLY ===== */
                        #rppm-document table {
                            width: 100% !important;
                            max-width: 100% !important;
                            border-collapse: collapse;
                            margin: 14pt 0 18pt 0;
                            table-layout: fixed !important;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }
                        
                        #rppm-document table td,
                        #rppm-document table th {
                            border: 1px solid #000;
                            padding: 8pt;
                            vertical-align: top;
                            font-size: 10.5pt;
                            line-height: 1.3;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            white-space: normal;
                            hyphens: auto;
                        }
                        
                        #rppm-document table th {
                            background-color: #f5f5f5;
                            font-weight: bold;
                            text-align: center;
                        }
                        
                        /* ===== AUTOMATIC COLUMN WIDTH - MATCH DOCX ===== */
                        /* 2 columns: 50% each */
                        #rppm-document table tr td:first-child:nth-last-child(2),
                        #rppm-document table tr td:first-child:nth-last-child(2) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(2),
                        #rppm-document table tr th:first-child:nth-last-child(2) ~ th {
                            width: 50% !important;
                        }
                        
                        /* 3 columns: 33.33% each */
                        #rppm-document table tr td:first-child:nth-last-child(3),
                        #rppm-document table tr td:first-child:nth-last-child(3) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(3),
                        #rppm-document table tr th:first-child:nth-last-child(3) ~ th {
                            width: 33.33% !important;
                        }
                        
                        /* 4 columns: 25% each */
                        #rppm-document table tr td:first-child:nth-last-child(4),
                        #rppm-document table tr td:first-child:nth-last-child(4) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(4),
                        #rppm-document table tr th:first-child:nth-last-child(4) ~ th {
                            width: 25% !important;
                        }
                        
                        /* 5 columns: 20% each */
                        #rppm-document table tr td:first-child:nth-last-child(5),
                        #rppm-document table tr td:first-child:nth-last-child(5) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(5),
                        #rppm-document table tr th:first-child:nth-last-child(5) ~ th {
                            width: 20% !important;
                        }
                        
                        /* 6 columns: 16.66% each */
                        #rppm-document table tr td:first-child:nth-last-child(6),
                        #rppm-document table tr td:first-child:nth-last-child(6) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(6),
                        #rppm-document table tr th:first-child:nth-last-child(6) ~ th {
                            width: 16.66% !important;
                        }
                        
                        /* 7 columns: 14.28% each */
                        #rppm-document table tr td:first-child:nth-last-child(7),
                        #rppm-document table tr td:first-child:nth-last-child(7) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(7),
                        #rppm-document table tr th:first-child:nth-last-child(7) ~ th {
                            width: 14.28% !important;
                        }
                        
                        /* 8 columns: 12.5% each */
                        #rppm-document table tr td:first-child:nth-last-child(8),
                        #rppm-document table tr td:first-child:nth-last-child(8) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(8),
                        #rppm-document table tr th:first-child:nth-last-child(8) ~ th {
                            width: 12.5% !important;
                        }
                        
                        /* 9 columns: 11.11% each */
                        #rppm-document table tr td:first-child:nth-last-child(9),
                        #rppm-document table tr td:first-child:nth-last-child(9) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(9),
                        #rppm-document table tr th:first-child:nth-last-child(9) ~ th {
                            width: 11.11% !important;
                        }
                        
                        /* 10 columns: 10% each */
                        #rppm-document table tr td:first-child:nth-last-child(10),
                        #rppm-document table tr td:first-child:nth-last-child(10) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(10),
                        #rppm-document table tr th:first-child:nth-last-child(10) ~ th {
                            width: 10% !important;
                        }
                        
                        /* 11 columns: 9.09% each */
                        #rppm-document table tr td:first-child:nth-last-child(11),
                        #rppm-document table tr td:first-child:nth-last-child(11) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(11),
                        #rppm-document table tr th:first-child:nth-last-child(11) ~ th {
                            width: 9.09% !important;
                        }
                        
                        /* 12 columns: 8.33% each */
                        #rppm-document table tr td:first-child:nth-last-child(12),
                        #rppm-document table tr td:first-child:nth-last-child(12) ~ td,
                        #rppm-document table tr th:first-child:nth-last-child(12),
                        #rppm-document table tr th:first-child:nth-last-child(12) ~ th {
                            width: 8.33% !important;
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
                            margin-top: 60pt;
                        }
                        
                        #rppm-document table:last-of-type td {
                            border: none !important;
                            padding: 24pt 20pt !important;
                            text-align: center;
                            line-height: 2.4;
                            width: 50% !important;
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
