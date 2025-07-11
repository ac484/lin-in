// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
// --------------------
// 型別定義區
// --------------------
import { Component, inject, OnDestroy, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { globalMessageBus } from '../../../../shared/services/global-message-bus';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, doc, runTransaction, collectionData, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { PdfA4Pipe } from '../../../../shared/pipes/pdf-a4.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { StepButtonComponent } from '../../../../../contract/contract/stepbutton/create/create.component';
import { MessagesComponent } from '../../../../../contract/contract/stepbutton/messages/messages.component';
import { FileComponent } from '../../../../../contract/contract/stepbutton/file/file.component';
import { OrganizationalComponent } from '../../../../../contract/contract/stepbutton/organizational/organizational.component';
import { RequestComponent } from '../../../../../contract/contract/stepbutton/request/request.component';
import { ChipsComponent } from '../../../../shared/components/chips/chips.component';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DocsviewerComponent } from '../../../../shared/components/docsviewer/docsviewer.component';

export interface PaymentRecord {
  round: number;
  status?: '初始' | '申請中' | '審核中' | '開票中' | '放款中' | '完成' | '已拒絕';
  percent: number;
  amount: number;
  applicant: string;
  date: string;
  note?: string;
}

export interface ChangeRecord {
  type: '追加' | '追減';
  amount: number;
  note?: string;
  date: string;
  user: string;
}

export interface Contract {
  status: string;
  code: string;
  orderNo: string;
  orderDate: string;
  projectNo: string;
  projectName: string;
  contractAmount: number;
  pendingPercent: number;
  invoicedAmount: number;
  paymentRound: number;
  paymentPercent: number;
  paymentStatus: string;
  invoiceStatus: string;
  note: string;
  url: string;
  payments?: PaymentRecord[];
  changes?: ChangeRecord[];
  members?: { name: string; role: string }[];
  tags?: string[];
}

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, ProgressBarModule, ToastModule, PrimeNgModule, FormsModule, ScrollPanelModule, StepButtonComponent, MessagesComponent, FileComponent, OrganizationalComponent, RequestComponent, TagModule, ChipsComponent, DocsviewerComponent],
  templateUrl: './contract-list.page.html',
  styleUrls: ['./contract-list.page.scss']
})
export class ContractListPage implements OnInit, OnDestroy {
  user: unknown = null;
  loading = true;
  uploadingContractCode: string | null = null;
  selectedContract: Contract | null = null;
  showStepper = false;
  expandedContracts = new Set<string>();
  showChangeDialog = false;
  changeType: '追加' | '追減' = '追加';
  selectedContractForChange: Contract | null = null;
  changeData = { amount: 0, note: '' };
  private destroyed$ = new Subject<void>();
  private toastShown = false;
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private injector = inject(Injector);
  private pdfA4Pipe = new PdfA4Pipe();
  private sanitizer = inject(DomSanitizer);
  firestoreContracts$: Observable<Contract[] | null>;
  _contracts: Contract[] | null = null;
  readonly statusList: PaymentRecord['status'][] = ['初始','申請中','審核中','開票中','放款中','完成'];
  readonly moonGrayScale: string[] = [
    'hsl(0, 0%, 98%)',
    'hsl(0, 0%, 95%)',
    'hsl(0, 0%, 90%)',
    'hsl(0, 0%, 85%)',
    'hsl(0, 0%, 80%)',
    'hsl(0, 0%, 75%)',
    'hsl(0, 0%, 70%)',
    'hsl(0, 0%, 65%)',
    'hsl(0, 0%, 60%)',
    'hsl(0, 0%, 55%)',
    'hsl(0, 0%, 50%)'
  ];
  readonly inProgressBgColors: string[] = [
    'hsl(120, 60%, 90%)',
    'hsl(120, 60%, 80%)',
    'hsl(120, 60%, 70%)',
    'hsl(120, 60%, 60%)',
    'hsl(120, 60%, 50%)',
    'hsl(120, 60%, 40%)',
    'hsl(120, 60%, 30%)',
    'hsl(120, 60%, 25%)',
    'hsl(120, 60%, 20%)',
    'hsl(120, 60%, 15%)'
  ];
  readonly changeBgColors: string[] = [
    'hsl(0, 60%, 90%)',
    'hsl(0, 60%, 80%)',
    'hsl(0, 60%, 70%)',
    'hsl(0, 60%, 60%)',
    'hsl(0, 60%, 50%)',
    'hsl(0, 60%, 40%)',
    'hsl(0, 60%, 30%)',
    'hsl(0, 60%, 25%)',
    'hsl(0, 60%, 20%)',
    'hsl(0, 60%, 15%)'
  ];
  get contracts(): Contract[] {
    return (this._contracts ?? []).slice().sort((a, b) => parseInt(a.code.replace('C-', ''), 10) - parseInt(b.code.replace('C-', ''), 10));
  }
  constructor() {
    inject(AuthService).user$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(user => {
        this.user = user;
        this.loading = false;
        if (user === null && !this.toastShown) {
          globalMessageBus.next({
            severity: 'warn',
            summary: '請先登入',
            detail: '請先登入才能瀏覽合約內容。'
          });
          this.toastShown = true;
        }
        if (user) {
          this.toastShown = false;
        }
      });
    const contractsCol = collection(this.firestore, 'contracts');
    this.firestoreContracts$ = collectionData(contractsCol, { idField: 'id' }) as Observable<Contract[] | null>;
    this.firestoreContracts$.pipe(takeUntil(this.destroyed$)).subscribe(data => { this._contracts = data; });
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  onRowSelect(event: any): void {
    if (event.data) {
      this.selectedContract = event.data as Contract;
    }
  }
  selectContract(contract: Contract): void {
    this.selectedContract = contract;
  }
  onUploading(code: string | null): void {
    this.uploadingContractCode = code;
  }
  onUploaded(url: string): void {}
  toggleExpand(contract: Contract, event: Event): void {
    event.stopPropagation();
    const code = contract.code;
    if (this.expandedContracts.has(code)) {
      this.expandedContracts.delete(code);
    } else {
      this.expandedContracts.add(code);
    }
  }
  editContract(contract: Contract, event: Event): void {
    event.stopPropagation();
  }
  onStepperCreated(data: { orderNo: string; projectNo: string; projectName: string; url: string; contractAmount: number; members: { name: string; role: string }[] }): void {
    const serialDoc = doc(this.firestore, 'meta/contract_serial');
    const contractsCol = collection(this.firestore, 'contracts');
    runTransaction(this.firestore, async (transaction) => {
      const serialSnap = await transaction.get(serialDoc);
      let current = 1;
      if (serialSnap.exists()) {
        const d = serialSnap.data() as { current: number };
        current = d.current + 1;
      }
      transaction.set(serialDoc, { current }, { merge: true });
      const code = `C-${current.toString().padStart(3, '0')}`;
      const contract: Contract = {
        status: '新建',
        code,
        orderNo: data.orderNo,
        orderDate: new Date().toISOString().split('T')[0],
        projectNo: data.projectNo,
        projectName: data.projectName,
        contractAmount: data.contractAmount,
        pendingPercent: 100,
        invoicedAmount: 0,
        paymentRound: 1,
        paymentPercent: 0,
        paymentStatus: '未請款',
        invoiceStatus: '未開立',
        note: '',
        url: data.url,
        members: data.members,
        payments: [],
        tags: []
      };
      transaction.set(doc(contractsCol), contract);
    });
    this.showStepper = false;
  }
  toStatus(contract: Contract, payment: PaymentRecord, status: PaymentRecord['status']): void {
    payment.status = status;
    this.updatePaymentStatusFirestore(contract);
  }
  updatePaymentStatusFirestore(contract: Contract): void {
    if ((contract as any).id) {
      const contractDoc = firestoreDoc(this.firestore, 'contracts', (contract as any).id);
      updateDoc(contractDoc, { payments: contract.payments });
    }
  }
  updateContractTags(contract: Contract, tags: string[]): void {
    contract.tags = tags;
    if ((contract as any).id) {
      const contractDoc = firestoreDoc(this.firestore, 'contracts', (contract as any).id);
      updateDoc(contractDoc, { tags });
    }
  }
  onRequestCompleted() {}
  getProgressSummary(contract: Contract): {notStarted: {count: number, percent: number}, inProgress: {count: number, percent: number}, completed: {count: number, percent: number}} {
    if (!contract.payments || contract.payments.length === 0) {
      return {
        notStarted: {count: 1, percent: 100},
        inProgress: {count: 0, percent: 0},
        completed: {count: 0, percent: 0}
      };
    }
    const totalAmount = contract.contractAmount;
    if (totalAmount <= 0) {
      return {
        notStarted: {count: 1, percent: 100},
        inProgress: {count: 0, percent: 0},
        completed: {count: 0, percent: 0}
      };
    }
    const completedPayments = contract.payments.filter(p => p.status === '完成');
    const inProgressPayments = contract.payments.filter(p => p.status && !['完成', '已拒絕'].includes(p.status));
    const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const inProgressAmount = inProgressPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaymentAmount = contract.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedPercent = Math.round((completedAmount / totalAmount) * 100);
    const inProgressPercent = Math.round((inProgressAmount / totalAmount) * 100);
    const notStartedPercent = Math.max(0, 100 - Math.round((totalPaymentAmount / totalAmount) * 100));
    const notStartedCount = notStartedPercent > 0 ? 1 : 0;
    return {
      notStarted: {count: notStartedCount, percent: notStartedPercent},
      inProgress: {count: inProgressPayments.length, percent: inProgressPercent},
      completed: {count: completedPayments.length, percent: completedPercent}
    };
  }
  getTotalProgressPercent(contract: Contract): number {
    if (!contract.payments || contract.payments.length === 0) {
      return 0;
    }
    const totalAmount = contract.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedAmount = contract.payments
      .filter(p => p.status === '完成')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return contract.contractAmount > 0 ? Math.round((completedAmount / contract.contractAmount) * 100) : 0;
  }
  getInvoicedPercent(contract: Contract): number {
    if (!contract.invoicedAmount || !contract.contractAmount) return 0;
    return Math.round((contract.invoicedAmount / contract.contractAmount) * 100);
  }
  getStatusPercent(contract: Contract, status: PaymentRecord['status']): number {
    if (!contract.payments || !contract.contractAmount) return 0;
    const total = contract.payments
      .filter(p => p.status === status)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return parseFloat(((total / contract.contractAmount) * 100).toFixed(2));
  }
  getDaysSinceCreation(contract: Contract): number {
    const creationDate = new Date(contract.orderDate);
    const diffTime = Date.now() - creationDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  getEventLog(contract: Contract): string[] {
    const changeLogs = (contract.changes || []).map(c => ({
      label: `[變更][${c.type}]${c.amount.toLocaleString()} 元` + (c.note ? ` [備註]：${c.note}` : ''),
      date: c.date
    }));
    const paymentLogs = (contract.payments || []).map(p => ({
      label:
        `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
        (p.date ? ` 日期${p.date.slice(0, 10)}` : '') +
        (p.note ? ` 備註${p.note}` : ''),
      date: p.date || ''
    }));
    const allLogs = [...changeLogs, ...paymentLogs].sort((a, b) => a.date.localeCompare(b.date));
    return allLogs.map(l => l.label);
  }
  getEventTimeline(contract: Contract): { label: string; date: string }[] {
    const changeTimeline = (contract.changes || []).map(c => ({
      label: `[變更][${c.type}]${c.amount.toLocaleString()} 元` + (c.note ? ` [備註]：${c.note}` : ''),
      date: c.date
    }));
    const paymentTimeline = (contract.payments || []).map(p => ({
      label:
        `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
        (p.note ? ` 備註${p.note}` : ''),
      date: p.date || ''
    }));
    const allTimeline = [...changeTimeline, ...paymentTimeline].sort((a, b) => a.date.localeCompare(b.date));
    return allTimeline;
  }
  getNetChange(contract: Contract): number {
    return (contract.changes ?? []).reduce((sum, c) =>
      sum + (c.type === '追加' ? c.amount : -c.amount), 0
    );
  }
  getOriginalAmount(contract: Contract): number {
    return contract.contractAmount - this.getNetChange(contract);
  }
  getStatusSeverity(label: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (label) {
      case '未開始': return 'danger';
      case '進行中': return 'warning';
      case '已完成': return 'success';
      default: return 'info';
    }
  }
  getPercentColor(percent: number): string {
    const p = Math.min(100, Math.max(0, percent));
    const hue = p * 1.2;
    return `hsl(${hue}, 100%, 40%)`;
  }
  getPercentColorByLabel(label: string, percent: number): string {
    const p = Math.min(100, Math.max(0, percent));
    if (label === '未開始') {
      const hue = 120 - (p * 1.2);
      return `hsl(${hue}, 100%, 40%)`;
    }
    if (label === '進行中') {
      const start = { h: 0, s: 0, l: 70 };
      const end = { h: 280, s: 50, l: 60 };
      const hue = start.h + ((end.h - start.h) * p) / 100;
      const sat = start.s + ((end.s - start.s) * p) / 100;
      const lum = start.l + ((end.l - start.l) * p) / 100;
      return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lum.toFixed(1)}%)`;
    }
    return this.getPercentColor(percent);
  }
  getTagBackground(label: string): string {
    if (label === '進行中') {
      return this.moonGrayScale[5];
    }
    return '';
  }
  getInfoBgColor(contract: Contract): string {
    const cnt = this.getProgressSummary(contract).inProgress.count;
    if (cnt <= 0) return '';
    const idx = Math.min(this.inProgressBgColors.length - 1, cnt - 1);
    return this.inProgressBgColors[idx];
  }
  getAmountBgColor(contract: Contract): string {
    const cnt = contract.changes ? contract.changes.length : 0;
    if (cnt <= 0) return '';
    const idx = Math.min(this.changeBgColors.length - 1, cnt - 1);
    return this.changeBgColors[idx];
  }
  openChangeDialog(contract: Contract, type: '追加' | '追減', event: Event): void {
    event.stopPropagation();
    this.selectedContractForChange = contract;
    this.changeType = type;
    this.changeData = { amount: 0, note: '' };
    this.showChangeDialog = true;
  }
  cancelChange(): void {
    this.showChangeDialog = false;
    this.selectedContractForChange = null;
    this.changeData = { amount: 0, note: '' };
  }
  executeChange(): void {
    if (!this.selectedContractForChange || this.changeData.amount <= 0) {
      return;
    }
    const contract = this.selectedContractForChange;
    if ((contract as any).id) {
      const originalAmount = contract.contractAmount;
      const newAmount = this.changeType === '追加'
        ? originalAmount + this.changeData.amount
        : originalAmount - this.changeData.amount;
      const changeRecord: ChangeRecord = {
        type: this.changeType,
        amount: this.changeData.amount,
        note: this.changeData.note,
        date: new Date().toISOString(),
        user: (this.user as any)?.displayName || (this.user as any)?.email || '未知'
      };
      const updatedChanges = [...(contract.changes || []), changeRecord];
      const contractDoc = firestoreDoc(this.firestore, 'contracts', (contract as any).id);
      updateDoc(contractDoc, {
        contractAmount: newAmount,
        changes: updatedChanges
      });
      this.showChangeDialog = false;
    }
  }
}
