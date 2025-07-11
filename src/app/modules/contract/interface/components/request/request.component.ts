import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { RequestPresenterService } from '../../services/request-presenter.service';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SliderModule],
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent {
  @Input() contract: any = null;
  @Input() user: any = null;
  @Output() completed = new EventEmitter<void>();
  visible = false;
  paymentAmount: number | null = null;
  paymentPercent: number | null = null;
  paymentNote = '';
  presenter = inject(RequestPresenterService);

  open(contract: any, user: any): void {
    this.contract = contract;
    this.user = user;
    this.visible = true;
    this.paymentAmount = null;
    this.paymentPercent = 0.01;
    this.onPaymentPercentChange(this.paymentPercent);
    this.paymentNote = '';
  }
  close() {
    this.visible = false;
  }
  onPaymentAmountChange(val: number): void {
    this.paymentAmount = parseFloat(val.toString());
    if (this.contract && this.contract.contractAmount > 0) {
      let p = (this.paymentAmount / this.contract.contractAmount) * 100;
      this.paymentPercent = parseFloat(p.toFixed(2));
    } else {
      this.paymentPercent = 0.01;
    }
  }
  onPaymentPercentChange(val: number): void {
    const percent = parseFloat(val.toFixed(2));
    this.paymentPercent = percent < 0.01 ? 0.01 : percent;
    if (this.contract && this.contract.contractAmount) {
      const amt = (this.paymentPercent / 100) * this.contract.contractAmount;
      this.paymentAmount = parseFloat(amt.toFixed(2));
    } else {
      this.paymentAmount = null;
    }
  }
  async submitPayment(): Promise<void> {
    if (!this.contract || this.paymentAmount === null || this.paymentPercent === null) {
      return;
    }
    await this.presenter.createPayment({
      contractId: this.contract.id,
      amount: this.paymentAmount,
      percent: this.paymentPercent,
      applicant: this.user?.displayName || this.user?.email || this.user || '未知',
      note: this.paymentNote
    });
    this.paymentAmount = null;
    this.paymentPercent = null;
    this.paymentNote = '';
    this.visible = false;
    this.completed.emit();
  }
} 