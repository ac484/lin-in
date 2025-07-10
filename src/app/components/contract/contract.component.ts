// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { AuthService } from '../../service/auth/auth.service';
import { globalMessageBus } from '../../shared/services/global-message-bus';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, doc, runTransaction, collectionData, DocumentData, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { PdfA4Pipe } from '../../shared/pipes/pdf-a4.pipe';
import { TimelineModule } from 'primeng/timeline';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StepButtonComponent } from './stepbutton/create/stepbutton.component';

export interface PaymentRecord {
  round: number;
  date: string;
  amount: number;
  percent: number;
  applicant: string;
  note?: string;
  status?: string;
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
}

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [CommonModule, SplitterModule, PrimeNgModule, FormsModule, TimelineModule, StepButtonComponent],
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnDestroy {
  user: unknown = null;
  loading = true;
  private destroyed$ = new Subject<void>();
  private toastShown = false;
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  firestoreContracts$: Observable<Contract[] | null>;
  _contracts: Contract[] | null = null;
  get contracts(): Contract[] {
    const arr = this._contracts ?? [];
    return arr.slice().sort((a, b) => {
      // code 格式 C-001, C-002...
      const n1 = parseInt(a.code.replace('C-', ''), 10);
      const n2 = parseInt(b.code.replace('C-', ''), 10);
      return n1 - n2;
    });
  }
  uploadingContractCode: string | null = null;
  selectedContract: Contract | null = null;
  safeUrl: SafeResourceUrl | null = null;
  private pdfA4Pipe = new PdfA4Pipe();
  private sanitizer = inject(DomSanitizer);
  dragging = false;
  draggingVertical = false;
  showStepper = false;

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

  isPdfUrl(url: string): boolean {
    // 檢查URL是否包含.pdf，不管是否有查詢參數
    return url.includes('.pdf');
  }

  onRowSelect(event: any): void {
    console.log('Row selected:', event);
    if (event.data) {
      this.selectedContract = event.data as Contract;
      console.log('Selected contract:', this.selectedContract.code);
      this.updateSafeUrl();
    }
  }

  selectContract(contract: Contract): void {
    this.selectedContract = contract;
    this.updateSafeUrl();
    console.log('Manually selected contract:', contract.code);
  }

  updateSafeUrl(): void {
    if (this.selectedContract && this.selectedContract.url && this.isPdfUrl(this.selectedContract.url)) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedContract.url);
    } else {
      this.safeUrl = null;
    }
  }

  async addContract(): Promise<void> {
    // 取得並遞增 contract_serial
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
    // 若為 PDF，先統一尺寸
    if (file.type === 'application/pdf') {
      file = new File([await this.pdfA4Pipe.transform(file)], file.name, { type: 'application/pdf' });
    }
    this.uploadingContractCode = contract.code;
    try {
      // 1. 上傳到 Storage
      const filePath = `contracts/${contract.code}_${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      // 2. 更新 Firestore 合約文件
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
    // TODO: 編輯功能可在此擴充
  }

  applyPayment(contract: Contract & { id?: string }, event: Event): void {
    event.stopPropagation();
    const payments = Array.isArray(contract.payments) ? contract.payments : [];
    const newRound = payments.length + 1;
    // 自動計算本次申請金額與百分比
    const total = contract.contractAmount || 0;
    // 假設每次平均分配剩餘金額
    const remain = total - (payments.reduce((sum, p) => sum + (p.amount || 0), 0));
    const avgAmount = newRound < 10 ? Math.round(remain / (10 - payments.length)) : remain; // 最多10次
    const percent = total > 0 ? Math.round((avgAmount / total) * 100) : 0;
    const applicant = typeof this.user === 'object' && this.user && 'displayName' in this.user ? (this.user as any).displayName || '未知' : (this.user as string || '未知');
    const newRecord: PaymentRecord = {
      round: newRound,
      date: new Date().toISOString(),
      amount: avgAmount,
      percent,
      applicant,
      status: '申請中'
    };
    payments.push(newRecord);
    contract.payments = payments;
    contract.paymentRound = newRound;
    if (contract.id) {
      const contractDoc = firestoreDoc(this.firestore, 'contracts', contract.id);
      updateDoc(contractDoc, { payments, paymentRound: newRound });
    }
  }

  onSplitterResizeStart(): void {
    this.dragging = true;
  }
  onSplitterResizeEnd(): void {
    this.dragging = false;
  }

  onVerticalSplitterResizeStart(): void {
    this.draggingVertical = true;
  }
  onVerticalSplitterResizeEnd(): void {
    this.draggingVertical = false;
  }

  onStepperCreated(data: { orderNo: string; projectNo: string; projectName: string; url: string }): void {
    // 建立合約
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
        contractAmount: 0,
        invoicedAmount: 0,
        paymentRound: 1,
        paymentPercent: 0,
        paymentStatus: '未請款',
        invoiceStatus: '未開立',
        pendingPercent: 100,
        note: '',
        url: data.url
      };
      transaction.set(doc(contractsCol), contract);
    });
    this.showStepper = false;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
} 