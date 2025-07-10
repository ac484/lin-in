import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div style="max-width:480px;margin:64px auto;text-align:center;">
      <h1 style="margin-bottom:32px;">Angular 19 極簡 Material Demo</h1>
      <h2>歡迎來到 Angular 19 極簡專案</h2>
      <p>這裡是首頁介紹，請先登入以體驗完整功能。</p>
      <button mat-raised-button color="primary" (click)="goLogin()">登入 / 註冊</button>
    </div>
  `
})
export class HomeComponent {
  constructor(private router: Router) {}
  goLogin() { this.router.navigate(['/passport']); }
} 