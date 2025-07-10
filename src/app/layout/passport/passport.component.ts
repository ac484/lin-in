import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

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
      <h2>登入</h2>
      <form (ngSubmit)="loginWithEmail()" #f="ngForm">
        <mat-form-field style="width:100%">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="email" name="email" required type="email" />
        </mat-form-field>
        <mat-form-field style="width:100%">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="password" name="password" required type="password" />
        </mat-form-field>
        <button mat-raised-button color="primary" style="width:100%;margin-bottom:8px;" type="submit">Email 登入</button>
      </form>
      <button mat-stroked-button color="accent" style="width:100%;" (click)="loginWithGoogle()">Google 登入</button>
      <div *ngIf="error" style="color:red;margin-top:8px;">{{error}}</div>
    </mat-card>
  `
})
export class PassportComponent {
  email = '';
  password = '';
  error = '';
  constructor(private auth: AuthService) {}

  loginWithGoogle() {
    this.error = '';
    this.auth.loginWithGoogle().catch(e => this.error = e.message);
  }

  loginWithEmail() {
    this.error = '';
    this.auth.loginWithEmail(this.email, this.password).catch(e => this.error = e.message);
  }
}
