import { Component, inject } from '@angular/core';
import { AuthPresenterService } from '../../services/auth-presenter.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule],
  template: `
    <p-card styleClass="max-w-20rem mx-auto mt-8 p-4">
      <h2>註冊</h2>
      <form (ngSubmit)="register()" #f="ngForm">
        <div class="p-field mb-3">
          <label for="email">Email</label>
          <input pInputText id="email" [(ngModel)]="email" name="email" required type="email" class="w-full" />
        </div>
        <div class="p-field mb-3">
          <label for="password">Password</label>
          <input pInputText id="password" [(ngModel)]="password" name="password" required type="password" class="w-full" />
        </div>
        <button pButton type="submit" label="註冊" class="w-full mb-2" [severity]="'primary'"></button>
      </form>
      <div *ngIf="success" style="color:green;margin-top:8px;">註冊成功，請登入！</div>
      <div *ngIf="error" style="color:red;margin-top:8px;">{{error}}</div>
    </p-card>
  `
})
export class RegisterComponent {
  email = '';
  password = '';
  error = '';
  success = false;
  private auth = inject(AuthPresenterService);

  register() {
    this.error = ''; this.success = false;
    this.auth.registerWithEmail(this.email, this.password)
      .then(() => this.success = true)
      .catch((e: Error) => this.error = e.message);
  }
} 