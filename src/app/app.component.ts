import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from "./components/app.footer";
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './modules/prime-ng.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, RouterModule, PrimeNgModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private messageService: MessageService) {}

  showSuccess() {
    this.messageService.add({ severity: 'success', summary: '成功', detail: '操作已完成' });
  }
}
