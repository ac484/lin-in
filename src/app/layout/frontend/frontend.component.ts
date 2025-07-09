import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'layout-frontend',
  template: `
    <header>
      <h1>前台網站標題</h1>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <p>© 2024 公司名稱</p>
    </footer>
  `,
  imports: [RouterOutlet]
})
export class LayoutFrontendComponent {}
