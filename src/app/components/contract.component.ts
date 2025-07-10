import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth/auth.service';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [CommonModule, MessageModule],
  template: `
    <ng-container *ngIf="user$ | async as user; else loading">
      <ng-container *ngIf="user; else loginTip">
        <div class="p-8 text-2xl text-center">合約內容：<br>這是專案的合約頁面，僅限登入用戶瀏覽。</div>
      </ng-container>
    </ng-container>
    <ng-template #loading>
      <p-message severity="info" text="載入中..."></p-message>
    </ng-template>
    <ng-template #loginTip>
      <div class="p-8 text-center text-lg text-red-500">請先登入才能瀏覽合約內容。</div>
    </ng-template>
  `
})
export class ContractComponent {
  user$ = inject(AuthService).user$;
} 