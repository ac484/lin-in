import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CreateContractPresenterService } from '../../services/create-contract-presenter.service';
import { CreateContractCommand } from '../../../application/commands/create-contract.command';

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [CommonModule, StepperModule, ButtonModule, FormsModule],
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.scss']
})
export class CreateContractComponent {
  @Output() contractCreated = new EventEmitter<void>();
  step = 1;
  orderNo = '';
  projectNo = '';
  projectName = '';
  contractAmount: number | null = null;
  members = [{ name: '', role: '' }];
  pdfFile: File | null = null;
  url = '';
  uploading = false;
  presenter = inject(CreateContractPresenterService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.pdfFile = input.files[0];
  }

  async uploadPdf(): Promise<void> {
    if (!this.pdfFile) return;
    this.uploading = true;
    this.url = await this.presenter.uploadPdf(this.pdfFile);
    this.uploading = false;
  }

  async finish(): Promise<void> {
    if (!this.orderNo || !this.projectNo || !this.projectName || !this.contractAmount || !this.url) return;
    const command: CreateContractCommand = {
      orderNo: this.orderNo,
      projectNo: this.projectNo,
      projectName: this.projectName,
      contractAmount: this.contractAmount,
      url: this.url,
      members: this.members
    };
    await this.presenter.createContract(command);
    this.contractCreated.emit();
    this.reset();
  }

  reset(): void {
    this.step = 1;
    this.orderNo = '';
    this.projectNo = '';
    this.projectName = '';
    this.contractAmount = null;
    this.members = [{ name: '', role: '' }];
    this.pdfFile = null;
    this.url = '';
    this.uploading = false;
  }
} 