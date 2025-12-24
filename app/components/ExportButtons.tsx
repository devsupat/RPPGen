'use client';

import { useState } from 'react';
import { FileText, FileImage, Loader2 } from 'lucide-react';
import { exportToDocx } from '@/lib/exportDocx';
import { exportToPdf } from '@/lib/exportPdf';

interface ExportButtonsProps {
    rppm: Record<string, unknown>;
}

export default function ExportButtons({ rppm }: ExportButtonsProps) {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            await exportToDocx(rppm);
        } catch (error) {
            console.error('Export DOCX error:', error);
            alert('Gagal mengunduh file DOCX. Silakan coba lagi.');
        } finally {
            setIsExportingDocx(false);
        }
    };

    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        try {
            await exportToPdf(rppm);
        } catch (error) {
            console.error('Export PDF error:', error);
            alert('Gagal mengunduh file PDF. Silakan coba lagi.');
        } finally {
            setIsExportingPdf(false);
        }
    };

    return (
        <div className="fab-container">
            {/* DOCX Button */}
            <button
                onClick={handleExportDocx}
                disabled={isExportingDocx}
                className="fab btn-primary"
                title="Unduh DOCX"
            >
                {isExportingDocx ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <FileText className="w-6 h-6" />
                )}
            </button>

            {/* PDF Button */}
            <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="fab btn-success"
                title="Unduh PDF"
            >
                {isExportingPdf ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <FileImage className="w-6 h-6" />
                )}
            </button>
        </div>
    );
}
