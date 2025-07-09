import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'layout-hub',
  template: `
    <header>
      <h1>協作平台 HUB</h1>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <p>© 2024 團隊協作平台</p>
    </footer>
  `,
  styles: [`
    header { padding: 16px; background: #e3f2fd; }
    main { min-height: 60vh; }
    footer { text-align: center; color: #888; padding: 12px 0; }
  `],
  imports: [RouterOutlet]
})
export class LayoutHubComponent {}
