// Native DOCX Export - Using docx library for true Word documents
// Approach: HTML → DOMParser → docx objects → .docx
// Tables are fully editable in Microsoft Word

import { saveAs } from 'file-saver';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    WidthType,
    convertInchesToTwip,
    Footer,
    PageNumber,
    NumberFormat,
    ITableCellOptions,
    ISectionOptions,
    TableLayoutType,
    VerticalAlign,
} from 'docx';

// =============================================================================
// HTML PARSER - Convert HTML elements to docx objects
// =============================================================================

/**
 * Parse HTML string and convert to docx Document children
 */
function parseHtmlToDocx(html: string): (Paragraph | Table)[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstChild as HTMLElement;

    if (!root) return [];

    return parseChildren(root);
}

/**
 * Parse child nodes recursively
 */
function parseChildren(parent: HTMLElement): (Paragraph | Table)[] {
    const result: (Paragraph | Table)[] = [];

    for (const node of Array.from(parent.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                result.push(new Paragraph({ children: [new TextRun(text)] }));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const parsed = parseElement(element);
            if (parsed) {
                if (Array.isArray(parsed)) {
                    result.push(...parsed);
                } else {
                    result.push(parsed);
                }
            }
        }
    }

    return result;
}

/**
 * Parse a single HTML element to docx object(s)
 */
function parseElement(element: HTMLElement): Paragraph | Table | (Paragraph | Table)[] | null {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
        case 'h1':
            return createHeading(element, HeadingLevel.HEADING_1, true);
        case 'h2':
            return createHeading(element, HeadingLevel.HEADING_2, false);
        case 'h3':
            return createHeading(element, HeadingLevel.HEADING_3, false);
        case 'p':
            return createParagraph(element);
        case 'table':
            return createTable(element);
        case 'ol':
            return createOrderedList(element);
        case 'ul':
            return createUnorderedList(element);
        case 'blockquote':
            return createBlockquote(element);
        case 'hr':
            return createHorizontalRule();
        case 'br':
            return new Paragraph({ children: [] });
        case 'div':
        case 'span':
            return parseChildren(element);
        default:
            // For unknown tags, try to extract text content
            const text = element.textContent?.trim();
            if (text) {
                return new Paragraph({ children: [new TextRun(text)] });
            }
            return null;
    }
}

/**
 * Create a heading paragraph
 */
function createHeading(element: HTMLElement, level: typeof HeadingLevel[keyof typeof HeadingLevel], centered: boolean): Paragraph {
    const textRuns = extractTextRuns(element);

    return new Paragraph({
        heading: level,
        alignment: centered ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
            before: level === HeadingLevel.HEADING_1 ? 0 : 400,
            after: 200,
        },
        children: textRuns,
    });
}

/**
 * Create a regular paragraph
 */
function createParagraph(element: HTMLElement): Paragraph {
    const textRuns = extractTextRuns(element);

    return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
        children: textRuns,
    });
}

/**
 * Extract TextRun objects from element, handling <strong>, <em>, <br>
 */
function extractTextRuns(element: HTMLElement): TextRun[] {
    const runs: TextRun[] = [];

    for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text) {
                runs.push(new TextRun({ text, font: 'Times New Roman', size: 24 }));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const child = node as HTMLElement;
            const tag = child.tagName.toLowerCase();

            if (tag === 'strong' || tag === 'b') {
                runs.push(new TextRun({
                    text: child.textContent || '',
                    bold: true,
                    font: 'Times New Roman',
                    size: 24,
                }));
            } else if (tag === 'em' || tag === 'i') {
                runs.push(new TextRun({
                    text: child.textContent || '',
                    italics: true,
                    font: 'Times New Roman',
                    size: 24,
                }));
            } else if (tag === 'br') {
                runs.push(new TextRun({ text: '', break: 1 }));
            } else {
                // Recursively extract from other elements
                runs.push(...extractTextRuns(child));
            }
        }
    }

    return runs;
}

/**
 * Create a native Word table (fully editable!)
 */
function createTable(tableElement: HTMLElement): Table {
    const rows: TableRow[] = [];
    const tableRows = tableElement.querySelectorAll('tr');

    // Determine column count from first row
    const firstRow = tableRows[0];
    const colCount = firstRow ? firstRow.querySelectorAll('td, th').length : 1;

    // Calculate equal column widths (100% / colCount)
    const columnWidth = Math.floor(9000 / colCount); // 9000 twips ≈ page width

    for (const tr of Array.from(tableRows)) {
        const cells: TableCell[] = [];
        const cellElements = tr.querySelectorAll('td, th');

        for (const cellElement of Array.from(cellElements)) {
            const isHeader = cellElement.tagName.toLowerCase() === 'th';
            const bgColor = extractBackgroundColor(cellElement as HTMLElement);

            const cellOptions: ITableCellOptions = {
                children: [
                    new Paragraph({
                        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                        children: extractTextRuns(cellElement as HTMLElement),
                    }),
                ],
                width: { size: columnWidth, type: WidthType.DXA },
                shading: bgColor ? { fill: bgColor } : undefined,
                verticalAlign: VerticalAlign.TOP,
                margins: {
                    top: convertInchesToTwip(0.05),
                    bottom: convertInchesToTwip(0.05),
                    left: convertInchesToTwip(0.08),
                    right: convertInchesToTwip(0.08),
                },
            };

            cells.push(new TableCell(cellOptions));
        }

        // Ensure we have the right number of cells
        while (cells.length < colCount) {
            cells.push(new TableCell({
                children: [new Paragraph({ children: [] })],
                width: { size: columnWidth, type: WidthType.DXA },
            }));
        }

        rows.push(new TableRow({ children: cells }));
    }

    // Handle empty table
    if (rows.length === 0) {
        rows.push(new TableRow({
            children: [new TableCell({
                children: [new Paragraph({ children: [] })],
                width: { size: 9000, type: WidthType.DXA },
            })],
        }));
    }

    return new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        },
    });
}

/**
 * Extract background color from inline styles
 */
function extractBackgroundColor(element: HTMLElement): string | undefined {
    const style = element.getAttribute('style') || '';
    const bgMatch = style.match(/background-color:\s*(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|[a-z]+)/i);

    if (bgMatch) {
        let color = bgMatch[1];
        // Convert named colors to hex
        const namedColors: Record<string, string> = {
            '#f0f9ff': 'F0F9FF',
            '#ecfdf5': 'ECFDF5',
            '#fef3c7': 'FEF3C7',
            '#fce7f3': 'FCE7F3',
            '#e0e7ff': 'E0E7FF',
            '#fef9c3': 'FEF9C3',
            '#dbeafe': 'DBEAFE',
            '#dcfce7': 'DCFCE7',
            '#f0fdf4': 'F0FDF4',
            '#e0f2fe': 'E0F2FE',
            '#f5f5f5': 'F5F5F5',
        };

        color = color.toLowerCase();
        if (namedColors[color]) {
            return namedColors[color];
        }
        if (color.startsWith('#')) {
            return color.replace('#', '').toUpperCase();
        }
    }
    return undefined;
}

/**
 * Create ordered list (1. 2. 3.)
 */
function createOrderedList(element: HTMLElement): Paragraph[] {
    const items = element.querySelectorAll(':scope > li');
    const paragraphs: Paragraph[] = [];

    let index = 1;
    for (const li of Array.from(items)) {
        const textRuns = extractTextRuns(li as HTMLElement);
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: `${index}. `, bold: false, font: 'Times New Roman', size: 24 }),
                ...textRuns,
            ],
            spacing: { after: 100 },
            indent: { left: convertInchesToTwip(0.25) },
        }));
        index++;
    }

    return paragraphs;
}

/**
 * Create unordered list (bullets)
 */
function createUnorderedList(element: HTMLElement): Paragraph[] {
    const items = element.querySelectorAll(':scope > li');
    const paragraphs: Paragraph[] = [];

    for (const li of Array.from(items)) {
        const textRuns = extractTextRuns(li as HTMLElement);
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: '• ', font: 'Times New Roman', size: 24 }),
                ...textRuns,
            ],
            spacing: { after: 100 },
            indent: { left: convertInchesToTwip(0.25) },
        }));
    }

    return paragraphs;
}

/**
 * Create blockquote with left border styling
 */
function createBlockquote(element: HTMLElement): Paragraph {
    const textRuns = extractTextRuns(element);

    return new Paragraph({
        children: textRuns.map(run => new TextRun({
            ...run,
            italics: true,
        })),
        indent: { left: convertInchesToTwip(0.5) },
        spacing: { before: 200, after: 200 },
        border: {
            left: { style: BorderStyle.SINGLE, size: 24, color: '2563EB' },
        },
    });
}

/**
 * Create horizontal rule
 */
function createHorizontalRule(): Paragraph {
    return new Paragraph({
        children: [],
        spacing: { before: 200, after: 200 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
        },
    });
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Export RPPM to native .docx format
 * Tables are fully editable in Microsoft Word!
 */
export async function exportToDocx(rppm: { fullHtml?: string; generatedAt?: string }): Promise<void> {
    if (!rppm.fullHtml) {
        throw new Error('No HTML content to export');
    }

    try {
        // Parse HTML to docx objects
        const docChildren = parseHtmlToDocx(rppm.fullHtml);

        // Add footer with timestamp
        const footerText = `✨ Dokumen dihasilkan oleh GuruDok AI pada ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}`;

        // Create document
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: 'Times New Roman',
                            size: 24, // 12pt
                        },
                    },
                    heading1: {
                        run: {
                            font: 'Times New Roman',
                            size: 36, // 18pt
                            bold: true,
                        },
                        paragraph: {
                            spacing: { after: 300 },
                            alignment: AlignmentType.CENTER,
                        },
                    },
                    heading2: {
                        run: {
                            font: 'Times New Roman',
                            size: 28, // 14pt
                            bold: true,
                        },
                        paragraph: {
                            spacing: { before: 400, after: 200 },
                            border: {
                                bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
                            },
                        },
                    },
                    heading3: {
                        run: {
                            font: 'Times New Roman',
                            size: 24, // 12pt
                            bold: true,
                        },
                        paragraph: {
                            spacing: { before: 300, after: 150 },
                        },
                    },
                },
            },
            sections: [{
                properties: {
                    page: {
                        size: {
                            width: convertInchesToTwip(8.27), // A4 width
                            height: convertInchesToTwip(11.69), // A4 height
                        },
                        margin: {
                            top: convertInchesToTwip(1),
                            right: convertInchesToTwip(1),
                            bottom: convertInchesToTwip(1),
                            left: convertInchesToTwip(1),
                        },
                    },
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: footerText, size: 18, color: '666666' })],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                },
                children: docChildren,
            }],
        });

        // Generate and download
        const blob = await Packer.toBlob(doc);
        const date = new Date().toISOString().split('T')[0];
        saveAs(blob, `RPPM_${date}.docx`);

    } catch (error) {
        console.error('DOCX Export Error:', error);
        throw new Error('Gagal membuat file DOCX. Silakan coba lagi.');
    }
}

// =============================================================================
// BACKUP: HTML EXPORT (unchanged)
// =============================================================================

/**
 * Alternative: Export as pure HTML file
 * For viewing in browser or as backup
 */
export function exportToHtml(rppm: { fullHtml?: string; generatedAt?: string }): void {
    if (!rppm.fullHtml) {
        throw new Error('No HTML content to export');
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>RPPM - GuruDok AI</title>
    <style>
        @page { size: A4; margin: 2.5cm; }
        body {
            font-family: 'Times New Roman', Times, serif;
            max-width: 21cm;
            margin: 0 auto;
            padding: 2.5cm;
            line-height: 1.8;
            color: #1a1a1a;
            background: #f5f5f5;
        }
        @media print {
            body { background: white; padding: 0; margin: 0; }
        }
        .container {
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        @media print {
            .container { box-shadow: none; padding: 0; }
        }
        h1 { font-size: 18pt; text-align: center; margin-bottom: 18pt; }
        h2 { font-size: 14pt; border-bottom: 2pt solid #000; padding-bottom: 10pt; margin-top: 30pt; }
        h3 { font-size: 12pt; margin-top: 22pt; }
        p { margin-bottom: 12pt; text-align: justify; }
        table { 
            width: 100% !important; 
            max-width: 100% !important;
            border-collapse: collapse; 
            margin: 14pt 0 18pt 0;
            table-layout: fixed !important;
        }
        tr { page-break-inside: avoid; }
        td, th { 
            border: 1px solid #000; 
            padding: 8px; 
            vertical-align: top;
            word-wrap: break-word;
            font-size: 10.5pt;
        }
        th { background: #f5f5f5; }
        .footer { 
            margin-top: 40pt; 
            padding-top: 16pt;
            border-top: 1pt solid #ccc;
            text-align: center; 
            font-size: 9pt; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="container">
        ${rppm.fullHtml}
    </div>
    <div class="footer">
        ✨ Dihasilkan oleh GuruDok AI · ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const date = new Date().toISOString().split('T')[0];
    saveAs(blob, `RPPM_${date}.html`);
}
