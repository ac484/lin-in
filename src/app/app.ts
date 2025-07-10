import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Angular 19 極簡 Material Demo</span>
    </mat-toolbar>
    <mat-card style="max-width:400px;margin:2rem auto;text-align:center;">
      <h2>Material Card</h2>
      <mat-form-field appearance="outline" style="width:100%;">
        <mat-label>輸入內容</mat-label>
        <input matInput placeholder="請輸入..." />
      </mat-form-field>
      <br />
      <button mat-raised-button color="accent">
        <mat-icon>thumb_up</mat-icon>
        按我
      </button>
    </mat-card>
    <router-outlet />
  `
})
export class App {}
