// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Contract } from '../../contract.component';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Firestore, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { PdfA4Pipe } from '../../../../shared/pipes/pdf-a4.pipe';

@Component({
  selector: 'app-file',
  standalone: true,
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent {
  @Input() contract!: Contract & { id?: string };
  @Input() uploadingContractCode: string | null = null;
  @Output() uploading = new EventEmitter<string | null>();
  @Output() uploaded = new EventEmitter<string>();

  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private pdfA4Pipe = new PdfA4Pipe();

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    let file = input.files[0];
    if (file.type === 'application/pdf') {
      file = new File([await this.pdfA4Pipe.transform(file)], file.name, { type: 'application/pdf' });
    }
    this.uploading.emit(this.contract.code);
    try {
      const filePath = `contracts/${this.contract.code}_${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (this.contract.id) {
        const contractDoc = firestoreDoc(this.firestore, 'contracts', this.contract.id);
        await updateDoc(contractDoc, { url });
      }
      this.contract.url = url;
      this.uploaded.emit(url);
    } finally {
      this.uploading.emit(null);
      input.value = '';
    }
  }
}
