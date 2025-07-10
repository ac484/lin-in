import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { Firestore, collection as firestoreCollection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, serverTimestamp, getDocs, Timestamp, QuerySnapshot, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id?: string;
  contractId: string;
  user: string;
  message: string;
  createdAt: Date | Timestamp;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() contract: any = null;
  @Input() user: any = null;

  messages: Message[] = [];
  newMessage = '';
  loadingMessages = false;
  memoTimestamps: number[] = [];
  memoError = '';
  private messagesUnsub: (() => void) | null = null;
  private destroyed$ = new Subject<void>();
  private firestore = inject(Firestore);

  ngOnInit() {
    this.loadMemoTimestamps();
    this.listenMessages();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['contract']) {
      this.listenMessages();
    }
  }
  ngOnDestroy() {
    if (this.messagesUnsub) this.messagesUnsub();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  listenMessages(): void {
    if (this.messagesUnsub) this.messagesUnsub();
    if (!this.contract) return;
    this.loadingMessages = true;
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    const q = query(messagesCol, where('contractId', '==', this.contract.code), orderBy('createdAt', 'desc'));
    this.messagesUnsub = onSnapshot(q, (snap: QuerySnapshot<any>) => {
      this.messages = snap.docs.map((doc: QueryDocumentSnapshot<any>) => ({ id: doc.id, ...doc.data() } as Message));
      this.loadingMessages = false;
    });
  }
  async addMemo(): Promise<void> {
    if (!this.newMessage.trim() || !this.contract) return;
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
      contractId: this.contract.code,
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