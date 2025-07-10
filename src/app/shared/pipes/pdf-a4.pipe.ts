import { Pipe, PipeTransform } from '@angular/core';
import { PDFDocument } from 'pdf-lib';

@Pipe({ name: 'pdfA4', standalone: true })
export class PdfA4Pipe implements PipeTransform {
  async transform(file: File): Promise<Blob> {
    if (!file || file.type !== 'application/pdf') return file;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const A4_WIDTH = 595.28; // pt
    const A4_HEIGHT = 841.89; // pt
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      page.setSize(A4_WIDTH, A4_HEIGHT);
      // 這裡僅統一頁面尺寸，內容不自動縮放
    }
    const newPdfBytes = await pdfDoc.save();
    return new Blob([newPdfBytes], { type: 'application/pdf' });
  }
} 