import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-docsviewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="safeUrl">
      <iframe [src]="safeUrl" width="100%" height="100%" frameborder="0"></iframe>
    </ng-container>
    <div *ngIf="!safeUrl" class="text-gray-500">請選擇有 PDF 檔案的合約</div>
  `,
  styles: [':host { display: block; width: 100%; height: 100%; }']
})
export class DocsviewerComponent {
  @Input() src: string | null = null;
  safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.src && this.src.includes('.pdf')) {
      const gviewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.src)}&embedded=true`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(gviewUrl);
    } else {
      this.safeUrl = null;
    }
  }
} 