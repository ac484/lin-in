import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  template: `
    <section class="landing">
      <h1>歡迎來到我們的網站！</h1>
      <p>這是公開的落地頁，所有訪客都能看到。</p>
    </section>
  `,
  styles: [`
    .landing { text-align: center; margin-top: 40px; }
    .landing h1 { font-size: 2.5rem; }
  `]
})
export class LandingComponent {}
