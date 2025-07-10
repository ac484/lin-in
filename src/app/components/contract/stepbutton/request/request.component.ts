import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Contract, PaymentRecord } from '../../contract.component';
import { AuthService } from '../../../../service/auth/auth.service';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: 'request.component.html',
  styleUrls: ['request.component.scss']
})
export class RequestComponent {
  @Input() contract!: Contract;
  @Output() paymentCreated = new EventEmitter<PaymentRecord>();
  amount: number | null = null;
  note = '';
  user = inject(AuthService).user$;

  submit(): void {
    if (!this.contract || !this.amount) return;
    const payments = Array.isArray(this.contract.payments) ? this.contract.payments : [];
    const newRound = payments.length + 1;
    const total = this.contract.contractAmount || 0;
    const percent = total > 0 ? Math.round((this.amount / total) * 100) : 0;
    let applicant = '未知';
    this.user.subscribe(u => {
      if (u && typeof u === 'object' && 'displayName' in u) {
        applicant = (u as any).displayName || '未知';
      } else if (typeof u === 'string') {
        applicant = u;
      }
      const record: PaymentRecord = {
        round: newRound,
        date: new Date().toISOString(),
        amount: this.amount!,
        percent,
        applicant,
        note: this.note,
        status: '申請中'
      };
      this.paymentCreated.emit(record);
      this.amount = null;
      this.note = '';
    }).unsubscribe();
  }
} 