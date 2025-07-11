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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';
import { ScrollPanelModule } from 'primeng/scrollpanel';

// --------------------
// Component 區
// --------------------
@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, ProgressBarModule, ToastModule, PrimeNgModule, ScrollPanelModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  // --------------------
  // UI 狀態屬性
  // --------------------
  user: any = null; // 明確型別
  loading = true;

  // --------------------
  // 生命週期管理
  // --------------------
  private destroyed$ = new Subject<void>();
  private toastShown = false;

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
            detail: '請先登入才能使用工作區功能。'
          });
          this.toastShown = true;
        }
        if (user) {
          this.toastShown = false;
        }
      });
  }

  // --------------------
  // 生命週期
  // --------------------
  ngOnInit(): void {
    // 生命週期初始
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
