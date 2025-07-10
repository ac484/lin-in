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
    <app-topbar />
    <p-toast></p-toast>
    <router-outlet></router-outlet>
    <app-footer />
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
