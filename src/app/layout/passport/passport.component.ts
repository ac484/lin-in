import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-passport',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule
  ],
  template: `
    <mat-card style="max-width:360px;margin:48px auto;padding:24px;">
      <h2>{{ isRegister ? '註冊' : '登入' }}</h2>
      <form (ngSubmit)="isRegister ? register() : loginWithEmail()" #f="ngForm">
        <mat-form-field style="width:100%">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="email" name="email" required type="email" />
        </mat-form-field>
        <mat-form-field style="width:100%">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="password" name="password" required type="password" />
        </mat-form-field>
        <button mat-raised-button color="primary" style="width:100%;margin-bottom:8px;" type="submit">
          {{ isRegister ? '註冊' : '登入' }}
        </button>
      </form>
      <button mat-stroked-button color="accent" style="width:100%;margin-bottom:8px;" (click)="loginWithGoogle()">Google 登入</button>
      <button mat-button style="width:100%;" (click)="toggleMode()">
        {{ isRegister ? '已有帳號？登入' : '沒有帳號？註冊' }}
      </button>
      <div *ngIf="success" style="color:green;margin-top:8px;">{{ success }}</div>
      <div *ngIf="error" style="color:red;margin-top:8px;">{{error}}</div>
    </mat-card>
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
      .catch(e => this.error = e.message);
  }

  loginWithEmail() {
    this.error = '';
    this.success = '';
    this.auth.loginWithEmail(this.email, this.password)
      .then(() => this.router.navigate(['/basic']))
      .catch(e => this.error = e.message);
  }

  register() {
    this.error = '';
    this.success = '';
    this.auth.registerWithEmail(this.email, this.password)
      .then(() => this.success = '註冊成功，請登入！')
      .catch(e => this.error = e.message);
  }
}
