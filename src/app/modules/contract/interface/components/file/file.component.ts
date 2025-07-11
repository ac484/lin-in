import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePresenterService } from '../../services/file-presenter.service';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent {
  @Input() contract!: { code: string; id?: string; url?: string };
  @Input() uploadingContractCode: string | null = null;
  @Output() uploading = new EventEmitter<string | null>();
  @Output() uploaded = new EventEmitter<string>();
  presenter = inject(FilePresenterService);

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploading.emit(this.contract.code);
    try {
      const url = await this.presenter.uploadFile({
        contractCode: this.contract.code,
        contractId: this.contract.id,
        file
      });
      this.uploaded.emit(url);
    } finally {
      this.uploading.emit(null);
      input.value = '';
    }
  }
} 