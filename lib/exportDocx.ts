// DOCX Export Utility
// Client-side generation using docx library
// With defensive coding for variable AI response structures

import {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    Packer
} from 'docx';
import { saveAs } from 'file-saver';

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

export async function exportToDocx(rppm: Record<string, unknown>): Promise<void> {
    try {
        const children: (Paragraph | Table)[] = [];

        // Title
        const title = get(rppm, 'judul', 'Rencana Pembelajaran Mendalam');
        children.push(
            new Paragraph({
                text: title,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                text: 'Kurikulum Merdeka · Deep Learning Approach',
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' })
        );

        // Section: Informasi Umum
        children.push(
            new Paragraph({
                text: 'INFORMASI UMUM',
                heading: HeadingLevel.HEADING_2,
            })
        );

        const kepsek = getObject(rppm, 'kepsek');
        const guru = getObject(rppm, 'guru');

        const infoRows = [
            createTableRow('Sekolah', get(rppm, 'sekolah', '-')),
            createTableRow('Kepala Sekolah', `${get(kepsek, 'nama', '-')} (NIP: ${get(kepsek, 'nip', '-')})`),
            createTableRow('Guru Pengajar', `${get(guru, 'nama', '-')}${get(guru, 'nip') ? ` (NIP: ${get(guru, 'nip')})` : ''}`),
            createTableRow('Kelas / Fase', `${get(rppm, 'kelas', '-')} - ${get(rppm, 'fase', '-')}`),
            createTableRow('Mata Pelajaran', get(rppm, 'mapel', '-')),
            createTableRow('Topik', get(rppm, 'topik', '-')),
        ];

        const infoTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: infoRows,
        });
        children.push(infoTable, new Paragraph({ text: '' }));

        // Section: Capaian Pembelajaran
        const capaian = getObject(rppm, 'capaianPembelajaran');
        if (Object.keys(capaian).length > 0) {
            children.push(
                new Paragraph({
                    text: 'CAPAIAN PEMBELAJARAN (CP)',
                    heading: HeadingLevel.HEADING_2,
                })
            );

            for (const [elemen, deskripsi] of Object.entries(capaian)) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${elemen}: `, bold: true }),
                            new TextRun({ text: String(deskripsi) }),
                        ],
                    })
                );
            }
            children.push(new Paragraph({ text: '' }));
        }

        // Section: Identifikasi
        const identifikasi = getObject(rppm, 'identifikasi');
        const dimensi = getArray(identifikasi, 'dimensiProfilLulusan').map(d => String(d));

        children.push(
            new Paragraph({
                text: 'IDENTIFIKASI',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Karakteristik Murid: ', bold: true }),
                    new TextRun({ text: get(identifikasi, 'karakteristikMurid', '-') }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Karakter Materi: ', bold: true }),
                    new TextRun({ text: get(identifikasi, 'karakterMateri', '-') }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Dimensi Profil Pelajar Pancasila: ', bold: true }),
                    new TextRun({ text: dimensi.length > 0 ? dimensi.join(', ') : '-' }),
                ],
            }),
            new Paragraph({ text: '' })
        );

        // Section: Desain Pembelajaran
        const desain = getObject(rppm, 'desainPembelajaran');
        const deepLearning = getObject(desain, 'pendekatanDeepLearning');
        const digital = getArray(desain, 'pemanfaatanDigital').map(d => String(d));

        children.push(
            new Paragraph({
                text: 'DESAIN PEMBELAJARAN',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Model: ', bold: true }),
                    new TextRun({ text: get(desain, 'model', '-') }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Berkesadaran: ', bold: true }),
                    new TextRun({ text: get(deepLearning, 'berkesadaran', '-') }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Bermakna: ', bold: true }),
                    new TextRun({ text: get(deepLearning, 'bermakna', '-') }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Menggembirakan: ', bold: true }),
                    new TextRun({ text: get(deepLearning, 'menggembirakan', '-') }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Pemanfaatan Digital: ', bold: true }),
                    new TextRun({ text: digital.length > 0 ? digital.join(', ') : '-' }),
                ],
            }),
            new Paragraph({ text: '' })
        );

        // Section: Pengalaman Belajar
        const pengalaman = getObject(rppm, 'pengalamanBelajar');
        const pendahuluan = getArray(pengalaman, 'pendahuluan');
        const kegiatanInti = getArray(pengalaman, 'kegiatan_inti');
        const penutup = getArray(pengalaman, 'penutup');

        children.push(
            new Paragraph({
                text: 'PENGALAMAN BELAJAR',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                text: 'Pendahuluan:',
                heading: HeadingLevel.HEADING_3,
            })
        );

        for (const item of pendahuluan) {
            const text = typeof item === 'string' ? item : get(item as Record<string, unknown>, 'deskripsi', String(item));
            children.push(new Paragraph({ text: `• ${text}` }));
        }

        children.push(
            new Paragraph({
                text: 'Kegiatan Inti:',
                heading: HeadingLevel.HEADING_3,
            })
        );

        for (const item of kegiatanInti) {
            const obj = item as Record<string, unknown>;
            const deskripsi = get(obj, 'deskripsi', String(item));
            const label = get(obj, 'labelKompetensi', '');
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `• ${deskripsi} ` }),
                        new TextRun({ text: label ? `[${label}]` : '', italics: true }),
                    ],
                })
            );
        }

        children.push(
            new Paragraph({
                text: 'Penutup:',
                heading: HeadingLevel.HEADING_3,
            })
        );

        for (const item of penutup) {
            const text = typeof item === 'string' ? item : get(item as Record<string, unknown>, 'deskripsi', String(item));
            children.push(new Paragraph({ text: `• ${text}` }));
        }
        children.push(new Paragraph({ text: '' }));

        // Section: Rubrik Penilaian (SOLO)
        const rubrik = getArray(rppm, 'rubrikPenilaian');

        if (rubrik.length > 0) {
            children.push(
                new Paragraph({
                    text: 'RUBRIK PENILAIAN (TAKSONOMI SOLO)',
                    heading: HeadingLevel.HEADING_2,
                })
            );

            const rubrikRows = [
                new TableRow({
                    tableHeader: true,
                    children: [
                        createTableCell('Level', true),
                        createTableCell('Deskripsi', true),
                        createTableCell('Indikator', true),
                    ],
                }),
                ...rubrik.map(r => {
                    const row = r as Record<string, unknown>;
                    return new TableRow({
                        children: [
                            createTableCell(get(row, 'level', '-')),
                            createTableCell(get(row, 'deskripsi', '-')),
                            createTableCell(get(row, 'indikator', '-')),
                        ],
                    });
                }),
            ];

            const rubrikTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: rubrikRows,
            });
            children.push(rubrikTable, new Paragraph({ text: '' }));
        }

        // Footer
        children.push(
            new Paragraph({
                text: 'Dokumen dihasilkan oleh GuruPintar AI · Kurikulum Merdeka 2025',
                alignment: AlignmentType.CENTER,
            })
        );

        // Create document
        const doc = new Document({
            sections: [{
                children,
            }],
        });

        // Generate and download
        const blob = await Packer.toBlob(doc);
        const mapel = get(rppm, 'mapel', 'RPPM').replace(/\s+/g, '_');
        const topik = get(rppm, 'topik', 'Dokumen').replace(/\s+/g, '_').substring(0, 20);
        const fileName = `RPPM_${mapel}_${topik}.docx`;
        saveAs(blob, fileName);

    } catch (error) {
        console.error('DOCX Export Error:', error);
        throw new Error('Gagal membuat file DOCX. Silakan coba lagi.');
    }
}

function createTableRow(label: string, value: string): TableRow {
    return new TableRow({
        children: [
            createTableCell(label, true),
            createTableCell(value || '-'),
        ],
    });
}

function createTableCell(text: string, isHeader = false): TableCell {
    return new TableCell({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: text || '-',
                        bold: isHeader,
                    }),
                ],
            }),
        ],
        width: { size: isHeader ? 30 : 70, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
        },
    });
}
