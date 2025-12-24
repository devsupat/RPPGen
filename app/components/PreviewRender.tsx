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
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    <p className="text-amber-900 font-bold text-sm">PENTING: Jangan Refesh Halaman!</p>
                    <p className="text-amber-800 text-sm opacity-80">
                        Data ini TIDAK disimpan di server kami demi keamanan privasi Anda. Silakan ekspor ke DOCX atau PDF sekarang juga agar tidak hilang.
                    </p>
                </div>
            </div>

            {/* Document Container */}
            <div className="relative group">
                {/* Decorative gradients */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[2.5rem] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                <div
                    id="rppm-document"
                    className="relative bg-white p-12 sm:p-20 rounded-[2.5rem] shadow-2xl border border-gray-100 prose prose-slate max-w-none prose-headings:font-serif prose-p:font-serif prose-td:font-serif prose-th:font-serif"
                >
                    {/* Inject AI HTML with custom document styles */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        #rppm-document {
                            font-family: 'Times New Roman', Times, serif;
                            color: #1a1a1a;
                            line-height: 1.6;
                        }
                        #rppm-document h1 {
                            font-size: 24pt;
                            color: #000;
                            text-align: center;
                            margin-bottom: 5pt;
                            font-weight: bold;
                        }
                        #rppm-document h2 {
                            font-size: 18pt;
                            color: #000;
                            text-align: center;
                            margin-top: 0;
                            margin-bottom: 20pt;
                            text-transform: uppercase;
                        }
                        #rppm-document h3 {
                            font-size: 14pt;
                            border-bottom: 1.5pt solid #000;
                            padding-bottom: 4pt;
                            margin-top: 24pt;
                            margin-bottom: 12pt;
                            font-weight: bold;
                        }
                        #rppm-document p, #rppm-document li, #rppm-document td {
                            font-size: 12pt;
                        }
                        #rppm-document table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 15pt;
                        }
                        #rppm-document table[border="1"] td, #rppm-document table[border="1"] th {
                            border: 1px solid #000;
                            padding: 8pt;
                        }
                        #rppm-document .signature-block {
                            margin-top: 50pt;
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
