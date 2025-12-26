// PDF Export Utility - VECTOR PDF FIX
// Uses browser print for true vector PDF output (not bitmap)
// Proper print CSS injection for page breaks and table handling

/**
 * Print CSS to inject into HTML for proper PDF rendering
 * - @page rules for A4 size and margins
 * - page-break rules to prevent tables/rows from being cut
 * - thead repetition on new pages
 * - Headings stay with following content
 */
const PRINT_CSS = `
    /* ===== PAGE CONFIGURATION ===== */
    @page {
        size: A4;
        margin: 20mm;
    }

    /* ===== PRINT MEDIA RULES ===== */
    @media print {
        /* Force print colors */
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
        }

        /* ===== TABLE PAGE BREAK RULES ===== */
        table {
            width: 100% !important;
            border-collapse: collapse;
            page-break-inside: auto;
            table-layout: fixed !important;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Prevent row from being cut */
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        /* Repeat table headers on new pages */
        thead {
            display: table-header-group;
        }

        tfoot {
            display: table-footer-group;
        }

        td, th {
            border: 1px solid #000;
            padding: 8px 10px;
            vertical-align: top;
            font-size: 10pt;
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        th {
            background-color: #fef9c3 !important;
            font-weight: bold;
            text-align: center;
        }

        /* ===== HEADING PAGE BREAK RULES ===== */
        h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
        }

        h1 {
            font-size: 18pt;
            text-align: center;
            margin-top: 0;
            margin-bottom: 16pt;
            font-weight: bold;
        }

        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 24pt;
            margin-bottom: 12pt;
            padding-bottom: 6pt;
            border-bottom: 2pt solid #000;
        }

        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 18pt;
            margin-bottom: 8pt;
        }

        /* ===== CONTENT PAGE BREAK RULES ===== */
        section, article {
            page-break-inside: avoid;
        }

        p {
            margin-bottom: 10pt;
            text-align: justify;
            font-size: 11pt;
            orphans: 3;
            widows: 3;
        }

        /* Avoid orphan headings */
        h1 + *, h2 + *, h3 + *, h4 + * {
            page-break-before: avoid;
        }

        /* ===== LISTS ===== */
        ul, ol {
            margin-left: 20px;
            margin-top: 8pt;
            margin-bottom: 12pt;
            padding-left: 10px;
        }

        li {
            margin-bottom: 4pt;
            font-size: 11pt;
            page-break-inside: avoid;
        }

        /* ===== BLOCKQUOTES ===== */
        blockquote {
            border-left: 4pt solid #2563eb;
            padding: 10pt 14pt;
            margin: 14pt 0;
            font-style: italic;
            background: #f8fafc !important;
            page-break-inside: avoid;
        }

        /* ===== SIGNATURE TABLE (last table) ===== */
        table:last-of-type {
            margin-top: 40pt !important;
            page-break-inside: avoid;
        }

        table:last-of-type td {
            border: none !important;
            padding: 16pt 24pt !important;
            text-align: center;
            vertical-align: top;
            width: 50%;
            line-height: 2;
        }

        /* ===== HIDE NON-PRINT ELEMENTS ===== */
        .no-print, .fab-container, nav, .export-buttons {
            display: none !important;
        }

        /* ===== FOOTER ===== */
        .pdf-footer {
            margin-top: 30pt;
            padding-top: 12pt;
            border-top: 1pt solid #ccc;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }
    }

    /* ===== SCREEN STYLES (for preview window) ===== */
    @media screen {
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            box-sizing: border-box;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0 16pt 0;
            table-layout: fixed;
        }

        td, th {
            border: 1px solid #000;
            padding: 8px;
            vertical-align: top;
            font-size: 10pt;
        }

        th {
            background-color: #fef9c3;
            font-weight: bold;
            text-align: center;
        }

        h1 {
            font-size: 18pt;
            text-align: center;
            margin-bottom: 16pt;
        }

        h2 {
            font-size: 14pt;
            border-bottom: 2pt solid #000;
            padding-bottom: 6pt;
            margin-top: 24pt;
        }

        h3 {
            font-size: 12pt;
            margin-top: 18pt;
        }

        p {
            margin-bottom: 10pt;
            text-align: justify;
        }

        blockquote {
            border-left: 4pt solid #2563eb;
            padding: 10pt 14pt;
            margin: 14pt 0;
            font-style: italic;
            background: #f8fafc;
        }

        ul, ol {
            margin-left: 20px;
            padding-left: 10px;
        }

        table:last-of-type td {
            border: none;
            padding: 16pt 24pt;
            text-align: center;
        }

        .pdf-footer {
            margin-top: 30pt;
            padding-top: 12pt;
            border-top: 1pt solid #ccc;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }
    }
`;

/**
 * Export RPPM to PDF using browser's native print functionality
 * 
 * This approach generates TRUE VECTOR PDFs with:
 * - Searchable/selectable text
 * - Proper page breaks (CSS rules respected)
 * - Small file size (1-3MB instead of 100MB+)
 * - Tables that don't cut across pages
 * - Repeated table headers on new pages
 */
export async function exportToPdf(rppm: { fullHtml?: string; generatedAt?: string }): Promise<void> {
    if (!rppm.fullHtml) {
        throw new Error('No HTML content to export');
    }

    // Open new window for print
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        throw new Error('Popup diblokir. Mohon izinkan popup untuk mengunduh PDF.');
    }

    // Build complete HTML document with injected print CSS
    const htmlDocument = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RPPM - GuruPintar AI</title>
    <style>${PRINT_CSS}</style>
</head>
<body>
    ${rppm.fullHtml}
    <div class="pdf-footer">
        ✨ Dihasilkan pada: ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </div>
</body>
</html>
    `;

    // Write document
    printWindow.document.write(htmlDocument);
    printWindow.document.close();

    // Wait for content to render, then trigger print
    return new Promise((resolve) => {
        // Wait for fonts and layout to fully load
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                resolve();
            }, 300);
        };

        // Fallback if onload doesn't fire
        setTimeout(() => {
            printWindow.print();
            resolve();
        }, 1000);
    });
}

/**
 * Alternative: Direct print without opening new window
 * Uses an iframe for cleaner experience
 */
export function printToPdf(rppm: { fullHtml?: string; generatedAt?: string }): void {
    if (!rppm.fullHtml) {
        alert('Tidak ada konten untuk dicetak');
        return;
    }

    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        alert('Gagal membuat preview cetak');
        return;
    }

    // Build complete HTML document with injected print CSS
    const htmlDocument = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>RPPM - GuruPintar AI</title>
    <style>${PRINT_CSS}</style>
</head>
<body>
    ${rppm.fullHtml}
    <div class="pdf-footer">
        Dihasilkan pada: ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </div>
</body>
</html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlDocument);
    iframeDoc.close();

    // Wait for content to load then print
    setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after print dialog closes
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, 500);
}
