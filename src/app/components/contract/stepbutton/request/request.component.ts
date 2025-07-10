import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import type { Contract, PaymentRecord } from '../../contract.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent {
  @Input() contract: Contract | null = null;
  @Input() user: any = null;
  @Output() completed = new EventEmitter<void>();
  visible = false;
  paymentAmount: number | null = null;
  paymentPercent: number | null = null;
  paymentNote = '';
  private firestore = inject(Firestore);

  open(contract: Contract, user: any) {
    this.contract = contract;
    this.user = user;
    this.visible = true;
    this.paymentAmount = null;
    this.paymentPercent = null;
    this.paymentNote = '';
  }
  close() {
    this.visible = false;
  }
  onPaymentAmountChange(val: number): void {
    this.paymentAmount = val;
    if (this.contract && this.contract.contractAmount) {
      this.paymentPercent = this.contract.contractAmount > 0 ? Math.round((val / this.contract.contractAmount) * 100) : 0;
    } else {
      this.paymentPercent = 0;
    }
  }
  onPaymentPercentChange(val: number): void {
    this.paymentPercent = val;
    if (this.contract && this.contract.contractAmount) {
      this.paymentAmount = Math.round((val / 100) * this.contract.contractAmount);
    } else {
      this.paymentAmount = 0;
    }
  }
  submitPayment(): void {
    if (!this.contract || !this.paymentAmount || !this.paymentPercent) return;
    const contract = this.contract;
    const payments = Array.isArray(contract.payments) ? contract.payments : [];
    const newRound = payments.length + 1;
    let applicant = '未知';
    const user = this.user;
    if (user && typeof user === 'object' && 'displayName' in user) {
      applicant = (user as any).displayName || '未知';
    } else if (typeof user === 'string') {
      applicant = user;
    }
    const record: PaymentRecord = {
      round: newRound,
      date: new Date().toISOString(),
      amount: this.paymentAmount!,
      percent: this.paymentPercent!,
      applicant,
      note: this.paymentNote,
      status: '初始'
    };
    payments.push(record);
    if ((contract as any).id) {
      const contractDoc = firestoreDoc(this.firestore, 'contracts', (contract as any).id);
      updateDoc(contractDoc, { payments });
    }
    this.paymentAmount = null;
    this.paymentPercent = null;
    this.paymentNote = '';
    this.visible = false;
    this.completed.emit();
  }
}
