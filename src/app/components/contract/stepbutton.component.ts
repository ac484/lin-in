// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-stepbutton',
  standalone: true,
  imports: [CommonModule, StepperModule, ButtonModule, FormsModule],
  templateUrl: './stepbutton/stepbutton.component.html',
  styleUrls: ['./stepbutton/stepbutton.component.scss']
})
export class StepButtonComponent {
  @Output() contractCreated = new EventEmitter<{ orderNo: string; projectNo: string; projectName: string; url: string }>();
  orderNo = '';
  projectNo = '';
  projectName = '';
  pdfFile: File | null = null;
  uploading = false;
  url = '';
  storage = inject(Storage);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.pdfFile = input.files[0];
  }

  async uploadPdf(): Promise<void> {
    if (!this.pdfFile) return;
    this.uploading = true;
    try {
      const filePath = `contracts/tmp_${Date.now()}_${this.pdfFile.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, this.pdfFile);
      this.url = await getDownloadURL(storageRef);
    } finally {
      this.uploading = false;
    }
  }

  finish(): void {
    if (this.orderNo && this.projectNo && this.projectName && this.url) {
      this.contractCreated.emit({
        orderNo: this.orderNo,
        projectNo: this.projectNo,
        projectName: this.projectName,
        url: this.url
      });
      // 歸零表單
      this.orderNo = '';
      this.projectNo = '';
      this.projectName = '';
      this.pdfFile = null;
      this.url = '';
    }
  }
} 