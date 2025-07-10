import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, NgIf],
  template: `
    <ng-container *ngIf="user$ | async as user">
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <img *ngIf="user?.photoURL; else defaultIcon" [src]="user.photoURL!" alt="avatar" style="width:32px;height:32px;border-radius:50%" />
        <ng-template #defaultIcon>
          <mat-icon>account_circle</mat-icon>
        </ng-template>
      </button>
      <mat-menu #menu="matMenu" yPosition="above" overlapTrigger="false">
        <div style="padding:8px 16px;min-width:160px;">
          <div style="font-weight:bold;">{{ user?.displayName || user?.email }}</div>
        </div>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          登出
        </button>
      </mat-menu>
    </ng-container>
  `
})
export class UserAvatarComponent {
  user$!: Observable<User | null>;
  constructor(private auth: AuthService, private router: Router) {
    this.user$ = this.auth.user$ as Observable<User | null>;
  }
  logout() {
    this.auth.logout().then(() => this.router.navigate(['/passport']));
  }
} 