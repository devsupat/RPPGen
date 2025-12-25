// PDF Export Utility - TABLE LAYOUT FIXED
// Uses fullHtml as single source of truth (same as preview)
// FIXED: Consistent table styling with preview

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export RPPM to PDF using the same HTML content as preview
 * FIXED: Tables use 100% width and table-layout: fixed
 */
export async function exportToPdf(rppm: { fullHtml?: string; generatedAt?: string }): Promise<void> {
    if (!rppm.fullHtml) {
        throw new Error('No HTML content to export');
    }

    try {
        // Create a temporary container with CONSISTENT styling
        const container = document.createElement('div');
        container.innerHTML = `
            <style>
                /* ===== BASE CONTAINER ===== */
                .pdf-export-container {
                    font-family: 'Times New Roman', Times, serif;
                    color: #1a1a1a;
                    line-height: 1.8;
                    padding: 50px;
                    background: white;
                    width: 210mm;
                    max-width: 210mm;
                    box-sizing: border-box;
                }
                
                /* ===== HEADINGS ===== */
                .pdf-export-container h1 {
                    font-size: 18pt;
                    color: #000;
                    text-align: center;
                    margin-top: 0;
                    margin-bottom: 16pt;
                    font-weight: bold;
                }
                
                .pdf-export-container h2 {
                    font-size: 14pt;
                    color: #000;
                    font-weight: bold;
                    margin-top: 28pt;
                    margin-bottom: 14pt;
                    padding-bottom: 8pt;
                    border-bottom: 2pt solid #000;
                }
                
                .pdf-export-container h3 {
                    font-size: 12pt;
                    font-weight: bold;
                    margin-top: 20pt;
                    margin-bottom: 10pt;
                }
                
                .pdf-export-container p {
                    margin-bottom: 10pt;
                    text-align: justify;
                    font-size: 11pt;
                }
                
                .pdf-export-container li {
                    margin-bottom: 6pt;
                    font-size: 11pt;
                }
                
                /* ===== TABLES - RESPONSIVE ===== */
                .pdf-export-container table {
                    width: 100% !important;
                    max-width: 100% !important;
                    border-collapse: collapse;
                    margin: 12pt 0 16pt 0;
                    table-layout: fixed !important;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                .pdf-export-container table td,
                .pdf-export-container table th {
                    border: 1px solid #000;
                    padding: 8px;
                    vertical-align: top;
                    font-size: 10pt;
                    line-height: 1.4;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    hyphens: auto;
                }
                
                .pdf-export-container table th {
                    background-color: #fef9c3;
                    font-weight: bold;
                    text-align: center;
                }
                
                /* ===== BLOCKQUOTES ===== */
                .pdf-export-container blockquote {
                    border-left: 4pt solid #2563eb;
                    padding: 12pt 16pt;
                    margin: 16pt 0;
                    font-style: italic;
                    background: #f8fafc;
                }
                
                /* ===== LISTS ===== */
                .pdf-export-container ol, 
                .pdf-export-container ul {
                    margin-left: 24px;
                    margin-top: 8pt;
                    margin-bottom: 12pt;
                    padding-left: 8px;
                }
                
                /* ===== SIGNATURE ===== */
                .pdf-export-container table:last-of-type {
                    margin-top: 50pt !important;
                    margin-bottom: 30pt !important;
                }
                
                .pdf-export-container table:last-of-type td {
                    border: none !important;
                    padding: 20pt 30pt !important;
                    text-align: center;
                    vertical-align: top;
                    width: 50%;
                    line-height: 2.2;
                }
                
                /* Footer */
                .pdf-footer {
                    margin-top: 40pt;
                    padding-top: 16pt;
                    border-top: 1pt solid #e0e0e0;
                    text-align: center;
                    font-size: 9pt;
                    color: #666;
                }
            </style>
            <div class="pdf-export-container">
                ${rppm.fullHtml}
                <div class="pdf-footer">
                    ✨ Dihasilkan pada: ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
                </div>
            </div>
        `;

        // Append to body temporarily (hidden)
        container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 210mm;';
        document.body.appendChild(container);

        // Wait for fonts and layout to stabilize
        await new Promise(resolve => setTimeout(resolve, 800));

        // Convert to canvas with high quality
        const canvas = await html2canvas(container.querySelector('.pdf-export-container') as HTMLElement, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 794, // A4 width in px at 96dpi
        });

        // Remove temporary container
        document.body.removeChild(container);

        // Create PDF from canvas
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;

        // Calculate image dimensions to fit page
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Multi-page handling
        const usableHeight = pageHeight - 2 * margin;

        if (imgHeight <= usableHeight) {
            // Single page
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
            // Multi-page - slice the canvas properly
            let remainingHeight = imgHeight;
            let sourceY = 0;
            let pageNum = 0;

            while (remainingHeight > 0) {
                if (pageNum > 0) {
                    pdf.addPage();
                }

                const sliceHeightMM = Math.min(remainingHeight, usableHeight);
                const sliceHeightPx = (sliceHeightMM / imgHeight) * canvas.height;

                // Create slice canvas
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = sliceHeightPx;
                const ctx = sliceCanvas.getContext('2d');

                if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
                    ctx.drawImage(
                        canvas,
                        0, sourceY, canvas.width, sliceHeightPx,
                        0, 0, sliceCanvas.width, sliceHeightPx
                    );
                }

                pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, sliceHeightMM);

                sourceY += sliceHeightPx;
                remainingHeight -= sliceHeightMM;
                pageNum++;
            }
        }

        // Add page numbers
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }

        // Generate filename
        const date = new Date().toISOString().split('T')[0];
        pdf.save(`RPPM_${date}.pdf`);

    } catch (error) {
        console.error('PDF Export Error:', error);
        throw new Error('Gagal membuat file PDF. Silakan coba lagi.');
    }
}

/**
 * Alternative: Simple print-based PDF export
 */
export function printToPdf(rppm: { fullHtml?: string; generatedAt?: string }): void {
    if (!rppm.fullHtml) {
        alert('Tidak ada konten untuk dicetak');
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>RPPM - GuruPintar AI</title>
            <style>
                @page { size: A4; margin: 25mm; }
                body {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 12pt;
                    line-height: 1.8;
                    color: #000;
                    margin: 0;
                    padding: 0;
                }
                h1 { font-size: 18pt; text-align: center; margin-bottom: 16pt; }
                h2 { font-size: 14pt; border-bottom: 2pt solid #000; padding-bottom: 8pt; margin-top: 28pt; }
                h3 { font-size: 12pt; margin-top: 20pt; }
                p { margin-bottom: 10pt; text-align: justify; }
                table { 
                    width: 100% !important; 
                    border-collapse: collapse; 
                    margin: 12pt 0 16pt 0;
                    table-layout: fixed !important;
                    word-wrap: break-word;
                }
                tr { page-break-inside: avoid; }
                td, th { border: 1px solid #000; padding: 8px; word-wrap: break-word; }
                th { background-color: #f5f5f5; }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            ${rppm.fullHtml}
            <footer style="margin-top: 40pt; text-align: center; font-size: 9pt; color: #666;">
                Dihasilkan pada: ${rppm.generatedAt ? new Date(rppm.generatedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}
            </footer>
        </body>
        </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.print();
    }, 500);
}
