import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidenavComponent } from '../../shared/components/sidenav/sidenav.component';

@Component({
  selector: 'app-basic',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    SidenavComponent
  ],
  template: `

    <div class="basic-layout">
      <aside class="basic-sidenav">
        <app-sidenav />
      </aside>
      <main class="basic-main">
        <router-outlet />
      </main>
    </div>
  `
})
export class BasicComponent {}