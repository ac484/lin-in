import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Contract, PaymentRecord } from '../../contract.component';
import { AuthService } from '../../../../service/auth/auth.service';
import { Firestore, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: 'request.component.html',
  styleUrls: ['request.component.scss']
})
export class RequestComponent {
  @Input() contract!: Contract & { id?: string };
  @Output() paymentCreated = new EventEmitter<void>();
  amount: number | null = null;
  percent: number | null = null;
  note = '';
  user = inject(AuthService).user$;
  private firestore = inject(Firestore);

  onAmountChange(val: number): void {
    this.amount = val;
    if (this.contract && this.contract.contractAmount) {
      this.percent = this.contract.contractAmount > 0 ? Math.round((val / this.contract.contractAmount) * 100) : 0;
    } else {
      this.percent = 0;
    }
  }

  onPercentChange(val: number): void {
    this.percent = val;
    if (this.contract && this.contract.contractAmount) {
      this.amount = Math.round((val / 100) * this.contract.contractAmount);
    } else {
      this.amount = 0;
    }
  }

  submit(): void {
    if (!this.contract || !this.amount || !this.percent) return;
    const payments = Array.isArray(this.contract.payments) ? this.contract.payments : [];
    const newRound = payments.length + 1;
    let applicant = '未知';
    this.user.subscribe(async u => {
      if (u && typeof u === 'object' && 'displayName' in u) {
        applicant = (u as any).displayName || '未知';
      } else if (typeof u === 'string') {
        applicant = u;
      }
      const record: PaymentRecord = {
        round: newRound,
        date: new Date().toISOString(),
        amount: this.amount!,
        percent: this.percent!,
        applicant,
        note: this.note,
        status: '申請中'
      };
      payments.push(record);
      // Firestore 寫入
      if (this.contract.id) {
        const contractDoc = firestoreDoc(this.firestore, 'contracts', this.contract.id);
        await updateDoc(contractDoc, { payments });
      }
      this.amount = null;
      this.percent = null;
      this.note = '';
      this.paymentCreated.emit();
    }).unsubscribe();
  }
} 