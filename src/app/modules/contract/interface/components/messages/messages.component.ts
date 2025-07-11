import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessagePresenterService } from '../../services/message-presenter.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ScrollPanelModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  @Input() contract: any = null;
  @Input() user: any = null;
  messages = [];
  newMessage = '';
  loadingMessages = false;
  memoError = '';
  presenter = inject(MessagePresenterService);

  ngOnInit() {
    this.loadMessages();
  }

  async loadMessages() {
    if (!this.contract) return;
    this.loadingMessages = true;
    this.messages = await this.presenter.getMessages(this.contract.code);
    this.loadingMessages = false;
  }

  async addMemo() {
    if (!this.newMessage.trim() || !this.contract) return;
    try {
      await this.presenter.addMessage({
        contractId: this.contract.code,
        user: this.user?.displayName || '匿名',
        message: this.newMessage.trim()
      });
      this.newMessage = '';
      this.loadMessages();
    } catch (e: any) {
      this.memoError = e.message || '新增失敗';
    }
  }
} 