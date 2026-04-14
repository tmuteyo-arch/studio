'use client';

/**
 * Utility functions for PDF manipulation using pdf-lib.
 */

export async function countPdfPages(dataUri: string): Promise<number> {
  if (!dataUri || !dataUri.startsWith('data:application/pdf')) return 1;
  try {
    const { PDFDocument } = await import('pdf-lib');
    const base64 = dataUri.split(',')[1];
    const pdfBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (e) {
    console.error('Error counting PDF pages:', e);
    return 1;
  }
}

export async function mergeToPdf(pages: string[]): Promise<{ url: string, count: number }> {
  if (!pages || pages.length === 0) return { url: '', count: 0 };
  
  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();
  
  for (const pageDataUri of pages) {
    const base64 = pageDataUri.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    if (pageDataUri.startsWith('data:image')) {
      let image;
      if (pageDataUri.includes('png')) {
        image = await mergedPdf.embedPng(bytes);
      } else {
        image = await mergedPdf.embedJpg(bytes);
      }
      
      const page = mergedPdf.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    } else if (pageDataUri.startsWith('data:application/pdf')) {
      const donorPdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
  }
  
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ 
        url: reader.result as string, 
        count: mergedPdf.getPageCount() 
      });
    };
    reader.readAsDataURL(blob);
  });
}
