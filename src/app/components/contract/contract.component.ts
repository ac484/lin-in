// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
// --------------------
// 型別定義區
// --------------------
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../shared/services/auth/auth.service';
import { globalMessageBus } from '../../shared/services/global-message-bus';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, doc, runTransaction, collectionData, DocumentData, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { PdfA4Pipe } from '../../shared/pipes/pdf-a4.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StepButtonComponent } from './stepbutton/create/create.component';
import { MessagesComponent } from './stepbutton/messages/messages.component';
import { FileComponent } from './stepbutton/file/file.component';
import { OrganizationalComponent } from './stepbutton/organizational/organizational.component';
import { RequestComponent } from './stepbutton/request/request.component';
import { TagModule } from 'primeng/tag';
import { collection as firestoreCollection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, serverTimestamp, getDocs, Timestamp, QuerySnapshot, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Injector, runInInjectionContext } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';

export interface PaymentRecord {
  round: number; // 請款輪次
  status?: '初始' | '申請中' | '審核中' | '開票中' | '放款中' | '完成' | '已拒絕'; // 請款狀態
  percent: number; // 請款百分比
  amount: number; // 請款金額
  applicant: string; // 請款人
  date: string; // 請款日期
  note?: string; // 備註
}

export interface ChangeRecord {
  type: '追加' | '追減'; // 變更類型
  amount: number; // 變更金額
  note?: string; // 備註
  date: string; // 變更日期
  user: string; // 變更操作人
}

export interface Contract {
  status: string; // 合約狀態
  code: string; // 合約編號
  orderNo: string; // 訂單編號
  orderDate: string; // 訂單日期
  projectNo: string; // 專案編號
  projectName: string; // 專案名稱
  contractAmount: number; // 合約金額
  pendingPercent: number; // 尚未請款百分比 (可由 payments 計算)
  invoicedAmount: number; // 已開立金額 (可由 payments 計算)
  paymentRound: number; // 請款輪次 (可由 payments.length 計算)
  paymentPercent: number; // 請款百分比 (可由 payments 計算)
  paymentStatus: string; // 請款狀態 (可由 payments 計算)
  invoiceStatus: string; // 發票狀態
  note: string; // 備註
  url: string; // 檔案下載連結
  payments?: PaymentRecord[]; // 請款紀錄
  changes?: ChangeRecord[]; // 變更紀錄
  members?: { name: string; role: string }[]; // 合約成員
}

interface Message {
  id?: string;
  contractId: string;
  user: string;
  message: string;
  createdAt: Date | Timestamp;
}

// --------------------
// Component 區
// --------------------
@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [CommonModule, ProgressBarModule, ToastModule, PrimeNgModule, FormsModule, ScrollPanelModule, StepButtonComponent, MessagesComponent, FileComponent, OrganizationalComponent, RequestComponent, TagModule],
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnInit, OnDestroy {
  // --------------------
  // UI 狀態屬性
  // --------------------
  user: any = null; // 明確型別
  loading = true;
  uploadingContractCode: string | null = null;
  selectedContract: Contract | null = null;
  safeUrl: SafeResourceUrl | null = null;
  dragging = false;
  showStepper = false;
  expandedContracts = new Set<string>();
  // 請款相關屬性與方法已移除

  // 新增：變更功能屬性
  showChangeDialog = false;
  changeType: '追加' | '追減' = '追加';
  selectedContractForChange: Contract | null = null;
  changeData = { amount: 0, note: '' };
  
  // 新增：開啟變更對話框
  openChangeDialog(contract: Contract, type: '追加' | '追減', event: Event): void {
    event.stopPropagation();
    this.selectedContractForChange = contract;
    this.changeType = type;
    this.changeData = { amount: 0, note: '' };
    this.showChangeDialog = true;
  }

  // 新增：取消變更
  cancelChange(): void {
    this.showChangeDialog = false;
    this.selectedContractForChange = null;
    this.changeData = { amount: 0, note: '' };
  }
  
  // 新增：執行變更
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
        user: this.user?.displayName || this.user?.email || '未知'
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

  // --------------------
  // Firestore/Storage/DI
  // --------------------
  private destroyed$ = new Subject<void>();
  private toastShown = false;
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private injector = inject(Injector);
  private pdfA4Pipe = new PdfA4Pipe();
  private sanitizer = inject(DomSanitizer);
  private messagesUnsub: (() => void) | null = null;

  // --------------------
  // 資料流/常數
  // --------------------
  firestoreContracts$: Observable<Contract[] | null>;
  _contracts: Contract[] | null = null;
  readonly statusList: PaymentRecord['status'][] = ['初始','申請中','審核中','開票中','放款中','完成'];

  // --------------------
  // 顏色常數 (集中管理)
  // 月亮灰色階 (11色)
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
  // 綠色階 (進行中次數警示)
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
  // 紅色階 (變更次數警示)
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
  // --------------------
  // Getter
  // --------------------
  get contracts(): Contract[] {
    return (this._contracts ?? []).slice().sort((a, b) => parseInt(a.code.replace('C-', ''), 10) - parseInt(b.code.replace('C-', ''), 10));
  }

  // --------------------
  // 組織圖資料
  // --------------------
  // 刪除 orgChartExpanded, getOrgChartData, getDefaultOrgChartData

  // --------------------
  // Constructor
  // --------------------
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
    // 監聽 contracts collection
    const contractsCol = collection(this.firestore, 'contracts');
    this.firestoreContracts$ = collectionData(contractsCol, { idField: 'id' }) as Observable<Contract[] | null>;
    this.firestoreContracts$.pipe(takeUntil(this.destroyed$)).subscribe(data => { this._contracts = data; });
  }

  // --------------------
  // 生命週期
  // --------------------
  ngOnInit(): void {
    // 備忘錄相關移除
  }
  ngOnDestroy() {
    // 備忘錄相關移除
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // --------------------
  // 本地儲存/備忘錄、Firestore 留言相關、getMemoCooldown、getMessageDate、getNow 全部移除
  // --------------------

  // --------------------
  // UI 事件/操作
  // --------------------
  isPdfUrl(url: string): boolean {
    return url.includes('.pdf');
  }
  onRowSelect(event: any): void {
    if (event.data) {
      this.selectedContract = event.data as Contract;
      this.updateSafeUrl();
      // 備忘錄相關移除
    }
  }
  selectContract(contract: Contract): void {
    this.selectedContract = contract;
    this.updateSafeUrl();
    // 備忘錄相關移除
  }
  updateSafeUrl(): void {
    if (this.selectedContract && this.selectedContract.url && this.isPdfUrl(this.selectedContract.url)) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedContract.url);
    } else {
      this.safeUrl = null;
    }
  }
  // 移除 onContractFileSelected
  onUploading(code: string | null): void {
    this.uploadingContractCode = code;
  }
  onUploaded(url: string): void {
    // 可根據需要顯示提示或刷新資料，這裡保持極簡不做多餘處理
  }
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
  // 請款相關方法已移除
  onSplitterResizeStart(): void { this.dragging = true; }
  onSplitterResizeEnd(): void { this.dragging = false; }
  onVerticalSplitterResizeStart(): void { this.dragging = true; }
  onVerticalSplitterResizeEnd(): void { this.dragging = false; }
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
        payments: []
      };
      transaction.set(doc(contractsCol), contract);
    });
    this.showStepper = false;
  }
  // 請款相關方法已移除
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
  onRequestCompleted() {
    // 可根據需要刷新 contracts 或顯示提示，這裡保持極簡
  }

  // --------------------
  // 工具/輔助方法
  // --------------------
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
    
    // 計算各狀態的數量和金額
    const completedPayments = contract.payments.filter(p => p.status === '完成');
    const inProgressPayments = contract.payments.filter(p => p.status && !['完成', '已拒絕'].includes(p.status));
    
    const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const inProgressAmount = inProgressPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaymentAmount = contract.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const completedPercent = Math.round((completedAmount / totalAmount) * 100);
    const inProgressPercent = Math.round((inProgressAmount / totalAmount) * 100);
    const notStartedPercent = Math.max(0, 100 - Math.round((totalPaymentAmount / totalAmount) * 100));
    
    // 未開始數量：如果還有未申請的部分，顯示為1，否則為0
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
    return Math.round((total / contract.contractAmount) * 100);
  }
  // 新增方法：計算合約建立至今經過的天數
  getDaysSinceCreation(contract: Contract): number {
    const creationDate = new Date(contract.orderDate);
    const diffTime = Date.now() - creationDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  // 修改：事件紀錄包含變更與請款
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
  // 修改：歷程 Timeline 包含變更與請款
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
  // 計算合約淨變更額（追加正、追減負）
  getNetChange(contract: Contract): number {
    return (contract.changes ?? []).reduce((sum, c) =>
      sum + (c.type === '追加' ? c.amount : -c.amount), 0
    );
  }

  // 計算原始合約金額（現行金額扣除淨變更）
  getOriginalAmount(contract: Contract): number {
    return contract.contractAmount - this.getNetChange(contract);
  }
  // 備忘錄相關移除
  getNow(): number {
    return Date.now();
  }

  // 根據進度標籤回傳對應顏色
  getStatusSeverity(label: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (label) {
      case '未開始': return 'danger';
      case '進行中': return 'warning';
      case '已完成': return 'success';
      default: return 'info';
    }
  }

  /**
   * 根據百分比回傳 HSL 漸變色：0% 紅色(0deg) -> 100% 綠色(120deg)
   */
  getPercentColor(percent: number): string {
    // 限制在 [0,100]
    const p = Math.min(100, Math.max(0, percent));
    const hue = p * 1.2; // 0~120
    return `hsl(${hue}, 100%, 40%)`;
  }
  /**
   * 根據標籤回傳百分比顏色，'未開始' 使用反轉漸變
   */
  getPercentColorByLabel(label: string, percent: number): string {
    const p = Math.min(100, Math.max(0, percent));
    if (label === '未開始') {
      // 反向漸變: 0%綠->100%紅
      const hue = 120 - (p * 1.2);
      return `hsl(${hue}, 100%, 40%)`;
    }
    if (label === '進行中') {
      // 月亮灰 (無飽和度) -> 月亮紫
      const start = { h: 0, s: 0, l: 70 };
      const end = { h: 280, s: 50, l: 60 };
      const hue = start.h + ((end.h - start.h) * p) / 100;
      const sat = start.s + ((end.s - start.s) * p) / 100;
      const lum = start.l + ((end.l - start.l) * p) / 100;
      return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lum.toFixed(1)}%)`;
    }
    // 其餘使用一般紅-綠漸變
    return this.getPercentColor(percent);
  }
 
  /**
   * 根據標籤回傳 Tag 背景色，'進行中' 使用月亮色系
   */
  getTagBackground(label: string): string {
    if (label === '進行中') {
      // 使用月亮灰階中值
      return this.moonGrayScale[5];
    }
    return '';
  }
  /**
   * 根據 contract 中進行中數量回傳背景色
   */
  getInfoBgColor(contract: Contract): string {
    const cnt = this.getProgressSummary(contract).inProgress.count;
    if (cnt <= 0) return '';
    const idx = Math.min(this.inProgressBgColors.length - 1, cnt - 1);
    return this.inProgressBgColors[idx];
  }
  /**
   * 根據 contract 變更次數回傳金額欄背景色
   */
  getAmountBgColor(contract: Contract): string {
    const cnt = contract.changes ? contract.changes.length : 0;
    if (cnt <= 0) return '';
    const idx = Math.min(this.changeBgColors.length - 1, cnt - 1);
    return this.changeBgColors[idx];
  }
} 