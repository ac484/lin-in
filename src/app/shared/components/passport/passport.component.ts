import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-passport',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule
  ],
  template: `
    <p-card styleClass="max-w-20rem mx-auto mt-8 p-4">
      <h2>{{ isRegister ? '註冊' : '登入' }}</h2>
      <form (ngSubmit)="isRegister ? register() : loginWithEmail()" #f="ngForm">
        <div class="p-field mb-3">
          <label for="email">Email</label>
          <input pInputText id="email" [(ngModel)]="email" name="email" required type="email" class="w-full" />
        </div>
        <div class="p-field mb-3">
          <label for="password">Password</label>
          <input pInputText id="password" [(ngModel)]="password" name="password" required type="password" class="w-full" />
        </div>
        <button pButton type="submit" label="{{ isRegister ? '註冊' : '登入' }}" class="w-full mb-2" [severity]="'primary'"></button>
      </form>
      <button pButton type="button" label="Google 登入" class="w-full mb-2" [severity]="'secondary'" (click)="loginWithGoogle()"></button>
      <button pButton type="button" label="{{ isRegister ? '已有帳號？登入' : '沒有帳號？註冊' }}" class="w-full p-button-text" (click)="toggleMode()"></button>
      <div *ngIf="success" style="color:green;margin-top:8px;">{{ success }}</div>
      <div *ngIf="error" style="color:red;margin-top:8px;">{{error}}</div>
    </p-card>
  `
})
export class PassportComponent {
  isRegister = false;
  email = '';
  password = '';
  error = '';
  success = '';
  constructor(private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.error = '';
    this.success = '';
  }

  loginWithGoogle() {
    this.error = '';
    this.success = '';
    this.auth.loginWithGoogle()
      .then(() => this.router.navigate(['/basic']))
      .catch((e: Error) => this.error = e.message);
  }

  loginWithEmail() {
    this.error = '';
    this.success = '';
    this.auth.loginWithEmail(this.email, this.password)
      .then(() => this.router.navigate(['/basic']))
      .catch((e: Error) => this.error = e.message);
  }

  register() {
    this.error = '';
    this.success = '';
    this.auth.registerWithEmail(this.email, this.password)
      .then(() => this.success = '註冊成功，請登入！')
      .catch((e: Error) => this.error = e.message);
  }
}
