import { Injectable } from '@angular/core';
import { MessageDto } from '../../../application/dto/message.dto';

@Injectable({ providedIn: 'root' })
export class MessageRepository {
  private messages: MessageDto[] = [];

  async add(dto: MessageDto): Promise<void> {
    this.messages.push(dto);
  }

  async getByContractId(contractId: string): Promise<MessageDto[]> {
    return this.messages.filter(m => m.contractId === contractId);
  }
} 