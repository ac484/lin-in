import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-basic',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    RouterOutlet
  ],
  template: `
    <mat-sidenav-container style="height:100vh;">
      <mat-sidenav mode="side" opened>
        <mat-toolbar>選單</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/passport"><mat-icon>vpn_key</mat-icon> Passport</a>
          <a mat-list-item routerLink="/open"><mat-icon>lock_open</mat-icon> Open</a>
          <a mat-list-item routerLink="/blank"><mat-icon>crop_square</mat-icon> Blank</a>
          <a mat-list-item routerLink="/basic"><mat-icon>dashboard</mat-icon> Basic</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">Basic Layout</mat-toolbar>
        <div style="padding:24px;">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class BasicComponent {}
