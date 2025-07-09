import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'layout-ui',
  template: `
    <header>
      <h1>前台 UI 樣板</h1>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <p>© 2024 公司名稱</p>
    </footer>
  `,
  styles: [`
    header { padding: 16px; background: #f5f5f5; }
    main { min-height: 60vh; }
    footer { text-align: center; color: #888; padding: 12px 0; }
  `],
  imports: [RouterOutlet]
})
export class LayoutOpenComponent {}
