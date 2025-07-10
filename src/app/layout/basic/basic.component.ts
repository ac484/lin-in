import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-basic',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  template: `
    <div style="padding:24px;">
      <router-outlet />
    </div>
  `
})
export class BasicComponent {}
