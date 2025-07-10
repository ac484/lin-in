import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from "./components/app.footer";
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './shared/modules/prime-ng.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';

export interface GlobalMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

export const globalMessageBus = new Subject<GlobalMessage>();

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, RouterModule, PrimeNgModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService]
})
export class AppComponent {
  constructor(private messageService: MessageService) {
    globalMessageBus.subscribe((msg: GlobalMessage) => {
      this.messageService.add(msg);
    });
  }
}
