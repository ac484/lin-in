import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterModule, UserAvatarComponent],
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/open" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon>lock_open</mat-icon>
      </a>
      <a mat-list-item routerLink="/blank" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon>crop_square</mat-icon>
      </a>
      <a mat-list-item routerLink="/basic" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon>dashboard</mat-icon>
      </a>
      <a mat-list-item routerLink="/work" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon>work</mat-icon>
      </a>
    </mat-nav-list>
    <div style="flex:1 1 auto;"></div>
    <div style="margin-bottom:16px;display:flex;justify-content:center;overflow:visible;">
      <app-user-avatar />
    </div>
    <style>
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: visible;
      }
      .active-link {
        background: rgba(25, 118, 210, 0.12);
        color: #1976d2;
      }
      a.mat-list-item {
        justify-content: center;
      }
      mat-icon {
        font-size: 28px;
      }
    </style>
  `
})
export class SidenavComponent {} 