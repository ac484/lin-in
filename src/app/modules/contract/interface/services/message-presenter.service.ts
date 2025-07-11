import { Injectable } from '@angular/core';
import { AddMessageCommand } from '../../application/commands/add-message.command';
import { MessageApplicationService } from '../../application/services/message-application.service';

@Injectable({ providedIn: 'root' })
export class MessagePresenterService {
  constructor(private app: MessageApplicationService) {}

  async addMessage(command: AddMessageCommand): Promise<void> {
    await this.app.addMessage(command);
  }

  async getMessages(contractId: string) {
    return this.app.getMessages(contractId);
  }
} 