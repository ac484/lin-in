import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfig } from './app.config';
import { LayoutService } from '../shared/services/layout.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth/auth.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    StyleClassModule,
    AppConfig,
    DialogModule,
    FormsModule,
    InputTextModule,
    MenubarModule,
    RouterModule
  ],
  template: `
    <p-menubar [model]="menuItems">
      <ng-template pTemplate="end">
        <div class="flex items-center gap-2">
          <button type="button" class="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all text-surface-900 dark:text-surface-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:focus-visible:ring-offset-surface-950" (click)="toggleDarkMode()">
            <i class="pi text-base" [ngClass]="{ 'pi-moon': isDarkMode(), 'pi-sun': !isDarkMode() }"></i>
          </button>
          <div class="relative">
            <p-button pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true" icon="pi pi-cog" text rounded aria-label="Settings" />
            <app-config class="hidden" />
          </div>
          <button *ngIf="!(auth.user$ | async)" pButton type="button" label="登入" class="ml-2" (click)="showLogin = true"></button>
          <button *ngIf="auth.user$ | async" pButton type="button" label="登出" class="ml-2" (click)="logout()"></button>
        </div>
      </ng-template>
    </p-menubar>
    <p-dialog [(visible)]="showLogin" [modal]="true" [closable]="true" [header]="isRegister ? '註冊' : '登入'" [style]="{width: '350px'}">
      <form (ngSubmit)="isRegister ? registerWithEmail() : loginWithEmail()" #f="ngForm">
        <div class="mb-3">
          <input pInputText [(ngModel)]="email" name="email" required type="email" placeholder="Email" class="w-full" />
        </div>
        <div class="mb-3">
          <input pInputText [(ngModel)]="password" name="password" required type="password" placeholder="Password" class="w-full" />
        </div>
        <button pButton type="submit" [label]="isRegister ? '註冊' : '登入'" class="w-full mb-2" [severity]="'primary'"></button>
      </form>
      <button *ngIf="!isRegister" pButton type="button" label="Google 登入" class="w-full mb-2" [severity]="'secondary'" (click)="loginWithGoogle()"></button>
      <button pButton type="button" class="w-full p-button-text" [label]="isRegister ? '已有帳號？登入' : '沒有帳號？註冊'" (click)="toggleMode()"></button>
      <div *ngIf="error" style="color:red;margin-top:8px;">{{error}}</div>
      <div *ngIf="success" style="color:green;margin-top:8px;">{{success}}</div>
    </p-dialog>
  `
})
export class AppTopbar {
  layoutService: LayoutService = inject(LayoutService);
  isDarkMode = computed(() => this.layoutService.appState().darkMode);

  showLogin = false;
  isRegister = false;
  email = '';
  password = '';
  error = '';
  success = '';

  menuItems = [
    { label: '儀表板', icon: 'pi pi-chart-bar', routerLink: '/dashboard' },
    { label: '合約', icon: 'pi pi-file', routerLink: '/contract' },

  ];

  constructor(public auth: AuthService) {}

  toggleDarkMode() {
    this.layoutService.appState.update((state) => ({
      ...state,
      darkMode: !state.darkMode,
    }));
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.error = '';
    this.success = '';
  }

  loginWithEmail() {
    this.error = '';
    this.success = '';
    this.auth.loginWithEmail(this.email, this.password)
      .then(() => {
        this.showLogin = false;
        this.email = '';
        this.password = '';
      })
      .catch((e: Error) => this.error = e.message);
  }

  registerWithEmail() {
    this.error = '';
    this.success = '';
    this.auth.registerWithEmail(this.email, this.password)
      .then(() => {
        this.success = '註冊成功，請登入！';
        this.isRegister = false;
        this.email = '';
        this.password = '';
      })
      .catch((e: Error) => this.error = e.message);
  }

  loginWithGoogle() {
    this.error = '';
    this.success = '';
    this.auth.loginWithGoogle()
      .then(() => {
        this.showLogin = false;
        this.email = '';
        this.password = '';
      })
      .catch((e: Error) => this.error = e.message);
  }

  logout() {
    this.auth.logout();
  }
}
