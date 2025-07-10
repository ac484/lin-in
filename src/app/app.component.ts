import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from "./components/app.footer";
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './shared/modules/prime-ng.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { globalMessageBus, GlobalMessage } from './shared/services/global-message-bus';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, RouterModule, PrimeNgModule, ToastModule],
  template: `
    <div class="bg-surface-50 dark:bg-surface-950 min-h-screen p-8 flex flex-col gap-6">
      <app-topbar />
      <p-toast></p-toast>
      <div class="flex flex-col w-full max-w-7xl mx-auto gap-6 flex-1 h-full">
        <router-outlet></router-outlet>
      </div>
      <app-footer />
    </div>
  `,
  providers: [MessageService]
})
export class AppComponent {
  constructor(private messageService: MessageService) {
    globalMessageBus.subscribe((msg: GlobalMessage) => {
      this.messageService.add(msg);
    });
  }
}
