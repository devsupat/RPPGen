// PDF Export Utility
// Client-side generation using jsPDF
// With defensive coding for variable AI response structures

import jsPDF from 'jspdf';

// Helper to safely get nested values
function get(obj: Record<string, unknown>, path: string, defaultValue = ''): string {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return defaultValue;
        }
    }
    return result !== undefined && result !== null ? String(result) : defaultValue;
}

function getArray(obj: Record<string, unknown>, path: string): unknown[] {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return [];
        }
    }
    return Array.isArray(result) ? result : [];
}

function getObject(obj: Record<string, unknown>, path: string): Record<string, unknown> {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return {};
        }
    }
    return typeof result === 'object' && result !== null ? result as Record<string, unknown> : {};
}

export async function exportToPdf(rppm: Record<string, unknown>): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        let y = margin;

        // Helper functions
        const addTitle = (text: string) => {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(text || 'Rencana Pembelajaran', contentWidth);
            doc.text(lines, pageWidth / 2, y, { align: 'center' });
            y += lines.length * 7 + 2;
        };

        const addSubtitle = (text: string) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(text, pageWidth / 2, y, { align: 'center' });
            y += 6;
        };

        const addSection = (text: string) => {
            checkNewPage(15);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 82, 165);
            doc.text(text, margin, y);
            doc.setTextColor(0, 0, 0);
            y += 8;
        };

        const addLabelValue = (label: string, value: string) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const labelText = label + ': ';
            const labelWidth = doc.getTextWidth(labelText);
            doc.text(labelText, margin, y);
            doc.setFont('helvetica', 'normal');
            const safeValue = value || '-';
            const valueLines = doc.splitTextToSize(safeValue, contentWidth - labelWidth - 5);
            doc.text(valueLines, margin + labelWidth, y);
            y += Math.max(valueLines.length * 5, 5) + 2;
        };

        const addBullet = (text: string) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const safeText = text || '-';
            const lines = doc.splitTextToSize(safeText, contentWidth - 10);
            checkNewPage(lines.length * 5);
            doc.text('•', margin, y);
            doc.text(lines, margin + 5, y);
            y += lines.length * 5 + 2;
        };

        const checkNewPage = (neededSpace: number) => {
            const pageHeight = doc.internal.pageSize.getHeight();
            if (y + neededSpace > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // Extract data safely
        const kepsek = getObject(rppm, 'kepsek');
        const guru = getObject(rppm, 'guru');
        const identifikasi = getObject(rppm, 'identifikasi');
        const desain = getObject(rppm, 'desainPembelajaran');
        const deepLearning = getObject(desain, 'pendekatanDeepLearning');
        const pengalaman = getObject(rppm, 'pengalamanBelajar');

        // Title
        addTitle(get(rppm, 'judul', 'Rencana Pembelajaran Mendalam'));
        addSubtitle('Kurikulum Merdeka · Deep Learning Approach');
        y += 5;

        // Informasi Umum
        addSection('INFORMASI UMUM');
        addLabelValue('Sekolah', get(rppm, 'sekolah'));
        addLabelValue('Kepala Sekolah', `${get(kepsek, 'nama')} (NIP: ${get(kepsek, 'nip')})`);
        addLabelValue('Guru Pengajar', `${get(guru, 'nama')}${get(guru, 'nip') ? ` (NIP: ${get(guru, 'nip')})` : ''}`);
        addLabelValue('Kelas / Fase', `${get(rppm, 'kelas')} - ${get(rppm, 'fase')}`);
        addLabelValue('Mata Pelajaran', get(rppm, 'mapel'));
        addLabelValue('Topik', get(rppm, 'topik'));
        y += 3;

        // Capaian Pembelajaran
        const capaian = getObject(rppm, 'capaianPembelajaran');
        if (Object.keys(capaian).length > 0) {
            addSection('CAPAIAN PEMBELAJARAN (CP)');
            for (const [elemen, deskripsi] of Object.entries(capaian)) {
                addLabelValue(elemen, String(deskripsi));
            }
            y += 3;
        }

        // Identifikasi
        addSection('IDENTIFIKASI');
        addLabelValue('Karakteristik Murid', get(identifikasi, 'karakteristikMurid'));
        addLabelValue('Karakter Materi', get(identifikasi, 'karakterMateri'));
        const dimensi = getArray(identifikasi, 'dimensiProfilLulusan').map(d => String(d));
        addLabelValue('Dimensi Profil Pelajar Pancasila', dimensi.join(', ') || '-');
        y += 3;

        // Desain Pembelajaran
        addSection('DESAIN PEMBELAJARAN');
        addLabelValue('Model', get(desain, 'model'));
        addLabelValue('Berkesadaran', get(deepLearning, 'berkesadaran'));
        addLabelValue('Bermakna', get(deepLearning, 'bermakna'));
        addLabelValue('Menggembirakan', get(deepLearning, 'menggembirakan'));
        const digital = getArray(desain, 'pemanfaatanDigital').map(d => String(d));
        addLabelValue('Pemanfaatan Digital', digital.join(', ') || '-');
        y += 3;

        // Pengalaman Belajar
        addSection('PENGALAMAN BELAJAR');

        const pendahuluan = getArray(pengalaman, 'pendahuluan');
        if (pendahuluan.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Pendahuluan:', margin, y);
            y += 6;
            for (const item of pendahuluan) {
                const text = typeof item === 'string' ? item : get(item as Record<string, unknown>, 'deskripsi', String(item));
                addBullet(text);
            }
            y += 2;
        }

        const kegiatanInti = getArray(pengalaman, 'kegiatan_inti');
        if (kegiatanInti.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            checkNewPage(10);
            doc.text('Kegiatan Inti:', margin, y);
            y += 6;
            for (const item of kegiatanInti) {
                const obj = item as Record<string, unknown>;
                const deskripsi = get(obj, 'deskripsi', String(item));
                const label = get(obj, 'labelKompetensi', '');
                addBullet(`${deskripsi}${label ? ` [${label}]` : ''}`);
            }
            y += 2;
        }

        const penutup = getArray(pengalaman, 'penutup');
        if (penutup.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            checkNewPage(10);
            doc.text('Penutup:', margin, y);
            y += 6;
            for (const item of penutup) {
                const text = typeof item === 'string' ? item : get(item as Record<string, unknown>, 'deskripsi', String(item));
                addBullet(text);
            }
            y += 5;
        }

        // Rubrik Penilaian
        const rubrik = getArray(rppm, 'rubrikPenilaian');
        if (rubrik.length > 0) {
            addSection('RUBRIK PENILAIAN (TAKSONOMI SOLO)');

            const colWidths = [35, 60, 60];
            const rowHeight = 8;

            // Draw header
            checkNewPage(rowHeight + 20);
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, y, contentWidth, rowHeight, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Level', margin + 2, y + 5);
            doc.text('Deskripsi', margin + colWidths[0] + 2, y + 5);
            doc.text('Indikator', margin + colWidths[0] + colWidths[1] + 2, y + 5);
            y += rowHeight;

            // Draw rows
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);

            for (const r of rubrik) {
                const row = r as Record<string, unknown>;
                const level = get(row, 'level', '-');
                const deskripsi = get(row, 'deskripsi', '-');
                const indikator = get(row, 'indikator', '-');

                const descLines = doc.splitTextToSize(deskripsi, colWidths[1] - 4);
                const indLines = doc.splitTextToSize(indikator, colWidths[2] - 4);
                const maxLines = Math.max(descLines.length, indLines.length, 1);
                const cellHeight = maxLines * 4 + 4;

                checkNewPage(cellHeight);

                // Draw cell borders
                doc.rect(margin, y, colWidths[0], cellHeight);
                doc.rect(margin + colWidths[0], y, colWidths[1], cellHeight);
                doc.rect(margin + colWidths[0] + colWidths[1], y, colWidths[2], cellHeight);

                // Add text
                doc.text(level, margin + 2, y + 4);
                doc.text(descLines, margin + colWidths[0] + 2, y + 4);
                doc.text(indLines, margin + colWidths[0] + colWidths[1] + 2, y + 4);

                y += cellHeight;
            }
        }

        y += 10;

        // Footer
        checkNewPage(10);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('Dokumen dihasilkan oleh GuruPintar AI · Kurikulum Merdeka 2025', pageWidth / 2, y, { align: 'center' });

        // Save
        const mapel = get(rppm, 'mapel', 'RPPM').replace(/\s+/g, '_');
        const topik = get(rppm, 'topik', 'Dokumen').replace(/\s+/g, '_').substring(0, 20);
        const fileName = `RPPM_${mapel}_${topik}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error('PDF Export Error:', error);
        throw new Error('Gagal membuat file PDF. Silakan coba lagi.');
    }
}
