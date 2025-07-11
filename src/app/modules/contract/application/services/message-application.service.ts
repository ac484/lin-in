import { Injectable } from '@angular/core';
import { AddMessageCommand } from '../commands/add-message.command';
import { MessageDto } from '../dto/message.dto';
import { MessageRepository } from '../../infrastructure/persistence/message.repository';
import { MessageAddedEvent } from '../../domain/events/message-added.event';

@Injectable({ providedIn: 'root' })
export class MessageApplicationService {
  constructor(private repo: MessageRepository) {}

  async addMessage(command: AddMessageCommand): Promise<void> {
    const dto: MessageDto = { ...command, createdAt: new Date() };
    await this.repo.add(dto);
    new MessageAddedEvent(dto);
  }

  async getMessages(contractId: string): Promise<MessageDto[]> {
    return this.repo.getByContractId(contractId);
  }
} 