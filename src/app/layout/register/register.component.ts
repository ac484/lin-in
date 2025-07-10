import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
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
      <h2>註冊</h2>
      <form (ngSubmit)="register()" #f="ngForm">
        <mat-form-field style="width:100%">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="email" name="email" required type="email" />
        </mat-form-field>
        <mat-form-field style="width:100%">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="password" name="password" required type="password" />
        </mat-form-field>
        <button mat-raised-button color="primary" style="width:100%;margin-bottom:8px;" type="submit">註冊</button>
      </form>
      <div *ngIf="success" style="color:green;margin-top:8px;">註冊成功，請登入！</div>
      <div *ngIf="error" style="color:red;margin-top:8px;">{{error}}</div>
    </mat-card>
  `
})
export class RegisterComponent {
  email = '';
  password = '';
  error = '';
  success = false;
  constructor(private auth: AuthService) {}

  register() {
    this.error = '';
    this.success = false;
    this.auth.registerWithEmail(this.email, this.password)
      .then(() => this.success = true)
      .catch(e => this.error = e.message);
  }
} 