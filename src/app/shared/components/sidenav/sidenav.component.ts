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
    <nav class="sidenav-flex">
      <mat-nav-list class="sidenav-list">
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
      <div class="sidenav-spacer"></div>
      <app-user-avatar></app-user-avatar>
    </nav>
  `,
  styles: [`
    .sidenav-flex {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
      min-width: 64px;
    }
    .sidenav-list {
      width: 64px;
      padding: 0;
    }
    .sidenav-list a.mat-list-item {
      justify-content: center;
      padding: 0;
    }
    .sidenav-list mat-icon {
      font-size: 28px;
      display: block;
      margin: 0 auto;
    }
    app-user-avatar {
      display: block;
      margin: 0 auto 8px auto;
    }
    .sidenav-spacer {
      flex: 1 1 auto;
    }
  `]
})
export class SidenavComponent {} 