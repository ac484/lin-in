import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Angular 19 極簡 Material Demo</span>
    </mat-toolbar>
    <router-outlet />
  `
})
export class App {}
