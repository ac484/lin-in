// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
// --------------------
// 型別定義區
// --------------------
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../service/auth/auth.service';
import { globalMessageBus } from '../../shared/services/global-message-bus';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, doc, runTransaction, collectionData, DocumentData, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { PdfA4Pipe } from '../../shared/pipes/pdf-a4.pipe';
import { TimelineModule } from 'primeng/timeline';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StepButtonComponent } from './stepbutton/create/create.component';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { collection as firestoreCollection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, serverTimestamp, getDocs, Timestamp, QuerySnapshot, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Injector, runInInjectionContext } from '@angular/core';

export interface PaymentRecord {
  round: number;
  date: string;
  amount: number;
  percent: number;
  applicant: string;
  note?: string;
  status?: '初始' | '申請中' | '審核中' | '開票中' | '放款中' | '完成' | '已拒絕';
}

export interface Contract {
  status: string;
  code: string;
  orderNo: string;
  orderDate: string;
  projectNo: string;
  projectName: string;
  contractAmount: number;
  invoicedAmount: number;
  paymentRound: number;
  paymentPercent: number;
  paymentStatus: string;
  invoiceStatus: string;
  pendingPercent: number;
  note: string;
  url: string; // 檔案下載連結
  payments?: PaymentRecord[];
  members?: { name: string; role: string }[];
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
  imports: [CommonModule, ProgressBarModule, ToastModule, PrimeNgModule, FormsModule, StepButtonComponent, OrganizationChartModule],
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
  showRequest: Contract | null = null;
  paymentAmount: number | null = null;
  paymentPercent: number | null = null;
  paymentNote = '';
  orgChartExpanded = true;
  messages: Message[] = [];
  newMessage = '';
  loadingMessages = false;
  memoTimestamps: number[] = [];
  memoError = '';

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
  // Getter
  // --------------------
  get contracts(): Contract[] {
    return (this._contracts ?? []).slice().sort((a, b) => parseInt(a.code.replace('C-', ''), 10) - parseInt(b.code.replace('C-', ''), 10));
  }

  // --------------------
  // 組織圖資料
  // --------------------
  getOrgChartData(contract: Contract): any {
    return {
      label: contract.projectName || '專案團隊',
      expanded: true,
      children: (contract.members && contract.members.length > 0
        ? contract.members
        : [
            { name: '', role: '' },
            { name: '', role: '' },
            { name: '', role: '' }
          ]
      ).map(m => ({
        label: m.role || '角色',
        type: 'person',
        data: m
      }))
    };
  }
  getDefaultOrgChartData(): any {
    return {
      label: this.selectedContract?.projectName || '專案團隊',
      expanded: this.orgChartExpanded,
      children: [
        { label: '角色', type: 'person', data: { name: '', role: '' }, expanded: this.orgChartExpanded },
        { label: '角色', type: 'person', data: { name: '', role: '' }, expanded: this.orgChartExpanded },
        { label: '角色', type: 'person', data: { name: '', role: '' }, expanded: this.orgChartExpanded }
      ]
    };
  }

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
    this.listenMessages();
    this.loadMemoTimestamps();
  }
  ngOnDestroy() {
    if (this.messagesUnsub) this.messagesUnsub();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // --------------------
  // 本地儲存/備忘錄
  // --------------------
  loadMemoTimestamps(): void {
    const raw = localStorage.getItem('contract_memo_timestamps');
    this.memoTimestamps = raw ? JSON.parse(raw) : [];
    this.cleanupMemoTimestamps();
  }
  saveMemoTimestamps(): void {
    localStorage.setItem('contract_memo_timestamps', JSON.stringify(this.memoTimestamps));
  }
  cleanupMemoTimestamps(): void {
    const now = Date.now();
    this.memoTimestamps = this.memoTimestamps.filter(ts => now - ts < 30 * 24 * 60 * 60 * 1000);
    this.saveMemoTimestamps();
  }
  getMemoCooldown(): number {
    const now = Date.now();
    this.cleanupMemoTimestamps();
    const last5min = this.memoTimestamps.filter(ts => now - ts < 5 * 60 * 1000).length;
    if (last5min >= 1) return 5 * 60 * 1000;
    const last1hr = this.memoTimestamps.filter(ts => now - ts < 60 * 60 * 1000).length;
    if (last1hr >= 10) return 10 * 60 * 1000;
    const last24hr = this.memoTimestamps.filter(ts => now - ts < 24 * 60 * 60 * 1000).length;
    if (last24hr >= 30) return 60 * 60 * 1000;
    const last30d = this.memoTimestamps.length;
    if (last30d >= 200) return 24 * 60 * 60 * 1000;
    return 0;
  }

  // --------------------
  // Firestore 留言相關
  // --------------------
  listenMessages(): void {
    if (this.messagesUnsub) this.messagesUnsub();
    if (!this.selectedContract) return;
    this.loadingMessages = true;
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    const q = query(messagesCol, where('contractId', '==', this.selectedContract.code), orderBy('createdAt', 'desc'));
    runInInjectionContext(this.injector, () => {
      this.messagesUnsub = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
        this.messages = snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Message));
        this.loadingMessages = false;
      });
    });
  }
  async addMemo(): Promise<void> {
    if (!this.newMessage.trim() || !this.selectedContract) return;
    const now = Date.now();
    const cooldown = this.getMemoCooldown();
    const lastTs = this.memoTimestamps.length > 0 ? this.memoTimestamps[this.memoTimestamps.length - 1] : 0;
    if (cooldown > 0 && now - lastTs < cooldown) {
      this.memoError = `備忘錄新增過於頻繁，請稍候 ${(Math.ceil((cooldown - (now - lastTs))/1000))} 秒再試。`;
      return;
    }
    this.memoError = '';
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    await addDoc(messagesCol, {
      contractId: this.selectedContract.code,
      user: this.user?.displayName || '匿名',
      message: this.newMessage.trim(),
      createdAt: serverTimestamp(),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    this.memoTimestamps.push(now);
    this.saveMemoTimestamps();
    this.newMessage = '';
  }
  async removeExpiredMessages(): Promise<void> {
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    const q = query(messagesCol, where('expireAt', '<=', new Date()));
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      await deleteDoc(doc.ref);
    }
  }

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
      this.listenMessages();
    }
  }
  selectContract(contract: Contract): void {
    this.selectedContract = contract;
    this.updateSafeUrl();
    this.listenMessages();
  }
  updateSafeUrl(): void {
    if (this.selectedContract && this.selectedContract.url && this.isPdfUrl(this.selectedContract.url)) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedContract.url);
    } else {
      this.safeUrl = null;
    }
  }
  async addContract(): Promise<void> {
    const serialDoc = doc(this.firestore, 'meta/contract_serial');
    const contractsCol = collection(this.firestore, 'contracts');
    await runTransaction(this.firestore, async (transaction) => {
      const serialSnap = await transaction.get(serialDoc);
      let current = 1;
      if (serialSnap.exists()) {
        const data = serialSnap.data() as { current: number };
        current = data.current + 1;
      }
      transaction.set(serialDoc, { current }, { merge: true });
      const code = `C-${current.toString().padStart(3, '0')}`;
      const contract: Contract = {
        status: '新建',
        code,
        orderNo: '',
        orderDate: '',
        projectNo: '',
        projectName: '',
        contractAmount: 0,
        invoicedAmount: 0,
        paymentRound: 1,
        paymentPercent: 0,
        paymentStatus: '未請款',
        invoiceStatus: '未開立',
        pendingPercent: 100,
        note: '',
        url: ''
      };
      transaction.set(doc(contractsCol), contract);
    });
  }
  async onContractFileSelected(event: Event, contract: Contract & { id?: string }): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    let file = input.files[0];
    if (file.type === 'application/pdf') {
      file = new File([await this.pdfA4Pipe.transform(file)], file.name, { type: 'application/pdf' });
    }
    this.uploadingContractCode = contract.code;
    try {
      const filePath = `contracts/${contract.code}_${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (contract.id) {
        const contractDoc = firestoreDoc(this.firestore, 'contracts', contract.id);
        await updateDoc(contractDoc, { url });
      }
      contract.url = url;
    } finally {
      this.uploadingContractCode = null;
      input.value = '';
    }
  }
  toggleExpand(contract: Contract, event: Event): void {
    event.stopPropagation();
    (contract as any).expanded = !(contract as any).expanded;
  }
  editContract(contract: Contract, event: Event): void {
    event.stopPropagation();
  }
  applyPayment(contract: Contract): void {
    this.showRequest = contract;
  }
  closeRequestDialog(): void {
    this.showRequest = null;
  }
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
        orderDate: '',
        projectNo: data.projectNo,
        projectName: data.projectName,
        contractAmount: data.contractAmount,
        invoicedAmount: 0,
        paymentRound: 1,
        paymentPercent: 0,
        paymentStatus: '未請款',
        invoiceStatus: '未開立',
        pendingPercent: 100,
        note: '',
        url: data.url,
        members: data.members
      };
      transaction.set(doc(contractsCol), contract);
    });
    this.showStepper = false;
  }
  onPaymentAmountChange(val: number): void {
    this.paymentAmount = val;
    if (this.showRequest && this.showRequest.contractAmount) {
      this.paymentPercent = this.showRequest.contractAmount > 0 ? Math.round((val / this.showRequest.contractAmount) * 100) : 0;
    } else {
      this.paymentPercent = 0;
    }
  }
  onPaymentPercentChange(val: number): void {
    this.paymentPercent = val;
    if (this.showRequest && this.showRequest.contractAmount) {
      this.paymentAmount = Math.round((val / 100) * this.showRequest.contractAmount);
    } else {
      this.paymentAmount = 0;
    }
  }
  submitPayment(): void {
    if (!this.showRequest || !this.paymentAmount || !this.paymentPercent) return;
    const contract = this.showRequest;
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
    this.showRequest = null;
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

  // --------------------
  // 工具/輔助方法
  // --------------------
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
  getEventLog(contract: Contract): string[] {
    if (!contract.payments) return [];
    return contract.payments.map(p =>
      `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
      (p.date ? ` 日期${p.date.slice(0, 10)}` : '') +
      (p.note ? ` 備註${p.note}` : '')
    );
  }
  getEventTimeline(contract: Contract): { label: string; date: string }[] {
    if (!contract.payments) return [];
    return contract.payments.map(p => ({
      label:
        `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
        (p.note ? ` 備註${p.note}` : ''),
      date: p.date || ''
    }));
  }
  getMessageDate(msg: Message): Date | null {
    if (!msg.createdAt) return null;
    if (typeof (msg.createdAt as any).toDate === 'function') {
      return (msg.createdAt as any).toDate();
    }
    if (msg.createdAt instanceof Date) return msg.createdAt;
    return null;
  }
  getNow(): number {
    return Date.now();
  }
} 