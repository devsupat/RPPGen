// DOCX Export Utility - PRODUCTION READY
// Uses fullHtml with STRICT table width constraints
// Grade: Professional, layak release

import { saveAs } from 'file-saver';

/**
 * Export RPPM to DOCX-compatible format
 * CRITICAL: Tables MUST NOT exceed page width
 * Uses MSO-specific CSS for precise Word control
 */
export async function exportToDocx(rppm: { fullHtml?: string; generatedAt?: string }): Promise<void> {
    if (!rppm.fullHtml) {
        throw new Error('No HTML content to export');
    }

    try {
        // Create Word-compatible HTML with STRICT table constraints
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
        /* ============================================
           PAGE SETUP - A4 Portrait
           ============================================ */
        @page Section1 {
            size: 595.3pt 841.9pt;  /* A4 in points */
            margin: 2.5cm 2.5cm 2.5cm 2.5cm;
            mso-page-orientation: portrait;
        }
        
        div.Section1 { page: Section1; }
        
        /* ============================================
           BASE DOCUMENT STYLES
           ============================================ */
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.8;
            color: #000000;
            margin: 0;
            padding: 0;
            width: 595.3pt;  /* A4 width */
            max-width: 595.3pt;
        }
        
        /* ============================================
           HEADINGS WITH PROFESSIONAL SPACING
           ============================================ */
        h1 {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 18pt 0;
            letter-spacing: 0.5pt;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 30pt 0 16pt 0;
            padding-bottom: 10pt;
            border-bottom: 2pt solid #000000;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin: 22pt 0 12pt 0;
            page-break-after: avoid;
        }
        
        /* ============================================
           TEXT ELEMENTS
           ============================================ */
        p {
            margin: 0 0 12pt 0;
            text-align: justify;
            line-height: 1.8;
        }
        
        ol, ul {
            margin: 10pt 0 14pt 0;
            padding-left: 28pt;
        }
        
        li {
            margin-bottom: 8pt;
            line-height: 1.6;
        }
        
        blockquote {
            border-left: 4pt solid #2563eb;
            padding: 14pt 0 14pt 18pt;
            margin: 18pt 0;
            font-style: italic;
            background-color: #f8fafc;
        }
        
        /* ============================================
           TABLES - STRICT WIDTH CONTROL
           ============================================ */
        table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            margin: 14pt 0 18pt 0;
            
            /* CRITICAL: Force table to fit page width */
            table-layout: fixed !important;
            
            /* MSO-specific properties for Word */
            mso-table-layout-alt: fixed;
            mso-table-wrap: none;
            mso-padding-alt: 0in 0in 0in 0in;
        }
        
        /* ============================================
           TABLE ROWS - PREVENT SPLITTING
           ============================================ */
        tr {
            page-break-inside: avoid !important;
            page-break-after: auto;
            
            /* MSO-specific */
            mso-row-margin-left: 0;
            mso-row-margin-right: 0;
        }
        
        /* ============================================
           TABLE CELLS - WORD WRAP ENABLED
           ============================================ */
        td, th {
            border: 1pt solid #000000;
            padding: 8pt !important;
            vertical-align: top;
            font-size: 10.5pt;
            line-height: 1.3;
            
            /* CRITICAL: Enable word wrapping */
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            
            /* MSO-specific cell properties */
            mso-cell-special: normal;
            mso-style-textfill-fill-alpha: 100.0%;
        }
        
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
            font-size: 10.5pt;
        }
        
        /* ============================================
           AUTOMATIC COLUMN WIDTH DISTRIBUTION
           For tables with many columns, distribute evenly
           ============================================ */
        
        /* 2 columns: 50% each */
        table tr td:first-child:nth-last-child(2),
        table tr td:first-child:nth-last-child(2) ~ td,
        table tr th:first-child:nth-last-child(2),
        table tr th:first-child:nth-last-child(2) ~ th {
            width: 50% !important;
        }
        
        /* 3 columns: 33.33% each */
        table tr td:first-child:nth-last-child(3),
        table tr td:first-child:nth-last-child(3) ~ td,
        table tr th:first-child:nth-last-child(3),
        table tr th:first-child:nth-last-child(3) ~ th {
            width: 33.33% !important;
        }
        
        /* 4 columns: 25% each */
        table tr td:first-child:nth-last-child(4),
        table tr td:first-child:nth-last-child(4) ~ td,
        table tr th:first-child:nth-last-child(4),
        table tr th:first-child:nth-last-child(4) ~ th {
            width: 25% !important;
        }
        
        /* 5 columns: 20% each */
        table tr td:first-child:nth-last-child(5),
        table tr td:first-child:nth-last-child(5) ~ td,
        table tr th:first-child:nth-last-child(5),
        table tr th:first-child:nth-last-child(5) ~ th {
            width: 20% !important;
        }
        
        /* 6 columns: 16.66% each */
        table tr td:first-child:nth-last-child(6),
        table tr td:first-child:nth-last-child(6) ~ td,
        table tr th:first-child:nth-last-child(6),
        table tr th:first-child:nth-last-child(6) ~ th {
            width: 16.66% !important;
        }
        
        /* 7 columns: 14.28% each */
        table tr td:first-child:nth-last-child(7),
        table tr td:first-child:nth-last-child(7) ~ td,
        table tr th:first-child:nth-last-child(7),
        table tr th:first-child:nth-last-child(7) ~ th {
            width: 14.28% !important;
        }
        
        /* 8 columns: 12.5% each */
        table tr td:first-child:nth-last-child(8),
        table tr td:first-child:nth-last-child(8) ~ td,
        table tr th:first-child:nth-last-child(8),
        table tr th:first-child:nth-last-child(8) ~ th {
            width: 12.5% !important;
        }
        
        /* 9 columns: 11.11% each */
        table tr td:first-child:nth-last-child(9),
        table tr td:first-child:nth-last-child(9) ~ td,
        table tr th:first-child:nth-last-child(9),
        table tr th:first-child:nth-last-child(9) ~ th {
            width: 11.11% !important;
        }
        
        /* 10 columns: 10% each */
        table tr td:first-child:nth-last-child(10),
        table tr td:first-child:nth-last-child(10) ~ td,
        table tr th:first-child:nth-last-child(10),
        table tr th:first-child:nth-last-child(10) ~ th {
            width: 10% !important;
        }
        
        /* 11 columns: 9.09% each */
        table tr td:first-child:nth-last-child(11),
        table tr td:first-child:nth-last-child(11) ~ td,
        table tr th:first-child:nth-last-child(11),
        table tr th:first-child:nth-last-child(11) ~ th {
            width: 9.09% !important;
        }
        
        /* 12 columns: 8.33% each */
        table tr td:first-child:nth-last-child(12),
        table tr td:first-child:nth-last-child(12) ~ td,
        table tr th:first-child:nth-last-child(12),
        table tr th:first-child:nth-last-child(12) ~ th {
            width: 8.33% !important;
        }
        
        /* ============================================
           SIGNATURE TABLE - NO BORDERS
           ============================================ */
        table:last-of-type {
            margin-top: 60pt !important;
            margin-bottom: 30pt !important;
            page-break-inside: avoid !important;
        }
        
        table:last-of-type td {
            border: none !important;
            padding: 24pt 20pt !important;
            text-align: center;
            vertical-align: top;
            width: 50% !important;
            line-height: 2.4;
        }
        
        table:last-of-type strong {
            display: block;
            margin-top: 50pt;
            margin-bottom: 4pt;
            font-size: 12pt;
        }
        
        /* ============================================
           PRINT & COMPATIBILITY
           ============================================ */
        @media print {
            body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            table {
                page-break-inside: auto !important;
            }
            tr {
                page-break-inside: avoid !important;
            }
        }
    </style>
</head>
<body>
<div class="Section1">
    ${rppm.fullHtml}
    
    <hr style="margin-top: 40pt; border: none; border-top: 1pt solid #cccccc;">
    <p style="text-align: center; font-size: 9pt; color: #666666; margin-top: 16pt;">
        ✨ Dokumen dihasilkan oleh GuruPintar AI pada ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </p>
</div>
</body>
</html>`;

        // Create blob with Word-compatible MIME type and BOM
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
    <title>RPPM - GuruPintar AI</title>
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
        ✨ Dihasilkan oleh GuruPintar AI · ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const date = new Date().toISOString().split('T')[0];
    saveAs(blob, `RPPM_${date}.html`);
}
