// DOCX Export Utility - TABLE LAYOUT FIXED
// Uses fullHtml as single source of truth (same as preview)
// FIXED: Responsive tables with percentage widths

import { saveAs } from 'file-saver';

/**
 * Export RPPM to DOCX-compatible format
 * FIXED: Tables use 100% width and table-layout: fixed for consistency
 */
export async function exportToDocx(rppm: { fullHtml?: string; generatedAt?: string }): Promise<void> {
    if (!rppm.fullHtml) {
        throw new Error('No HTML content to export');
    }

    try {
        // Create Word-compatible HTML with RESPONSIVE TABLE LAYOUT
        const wordHtml = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>RPPM - GuruPintar AI</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        /* ===== PAGE SETUP ===== */
        @page {
            size: A4;
            margin: 2.5cm;
        }
        
        /* ===== BASE STYLES ===== */
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.8;
            color: #000000;
            margin: 0;
            padding: 0;
            max-width: 100%;
        }
        
        /* ===== HEADINGS ===== */
        h1 {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-top: 0;
            margin-bottom: 18pt;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 30pt;
            margin-bottom: 16pt;
            padding-bottom: 10pt;
            border-bottom: 2pt solid #000000;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 22pt;
            margin-bottom: 12pt;
            page-break-after: avoid;
        }
        
        /* ===== TEXT ===== */
        p {
            margin-top: 0;
            margin-bottom: 12pt;
            text-align: justify;
        }
        
        ol, ul {
            margin-top: 10pt;
            margin-bottom: 14pt;
            padding-left: 28pt;
        }
        
        li {
            margin-bottom: 8pt;
            line-height: 1.6;
        }
        
        /* ===== TABLES - RESPONSIVE LAYOUT ===== */
        table {
            width: 100% !important;  /* CRITICAL: Always 100% width */
            max-width: 100% !important;
            border-collapse: collapse;
            margin-top: 14pt;
            margin-bottom: 18pt;
            table-layout: fixed !important; /* CRITICAL: Fixed layout */
            word-wrap: break-word;
            page-break-inside: auto;
        }
        
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        
        td, th {
            border: 1pt solid #000000;
            padding: 8pt;
            vertical-align: top;
            font-size: 11pt;
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
        }
        
        /* ===== BLOCKQUOTES ===== */
        blockquote {
            border-left: 4pt solid #2563eb;
            padding: 14pt 0 14pt 18pt;
            margin: 18pt 0;
            font-style: italic;
            background-color: #f8fafc;
        }
        
        /* ===== SIGNATURE BLOCK ===== */
        table:last-of-type {
            margin-top: 60pt !important;
            margin-bottom: 30pt !important;
            page-break-inside: avoid !important;
            border: none !important;
        }
        
        table:last-of-type td {
            border: none !important;
            padding: 24pt 20pt !important;
            text-align: center;
            vertical-align: top;
            width: 50%;
            line-height: 2.4;
        }
        
        table:last-of-type strong {
            display: block;
            margin-top: 50pt;
            margin-bottom: 4pt;
            font-size: 12pt;
        }
    </style>
</head>
<body>
    ${rppm.fullHtml}
    
    <hr style="margin-top: 40pt; border: none; border-top: 1pt solid #cccccc;">
    <p style="text-align: center; font-size: 9pt; color: #666666; margin-top: 16pt;">
        ✨ Dokumen dihasilkan oleh GuruPintar AI pada ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </p>
</body>
</html>`;

        // Create blob with Word-compatible MIME type
        const blob = new Blob(['\ufeff', wordHtml], {
            type: 'application/msword'
        });

        // Generate filename with date
        const date = new Date().toISOString().split('T')[0];
        saveAs(blob, `RPPM_${date}.doc`);

    } catch (error) {
        console.error('DOCX Export Error:', error);
        throw new Error('Gagal membuat file DOCX. Silakan coba lagi.');
    }
}

/**
 * Alternative: Export as pure HTML file
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
    <title>RPPM - GuruPintar AI</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            max-width: 210mm;
            margin: 0 auto;
            padding: 25mm;
            line-height: 1.8;
            color: #1a1a1a;
            background: #f5f5f5;
        }
        @media print {
            body { background: white; padding: 0; margin: 25mm; }
        }
        .container {
            background: white;
            padding: 50px;
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
            word-wrap: break-word;
        }
        tr { page-break-inside: avoid; }
        td, th { 
            border: 1px solid #000; 
            padding: 8px; 
            vertical-align: top;
            word-wrap: break-word;
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
        ✨ Dihasilkan oleh GuruPintar AI · ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const date = new Date().toISOString().split('T')[0];
    saveAs(blob, `RPPM_${date}.html`);
}
