import { MessageDto } from '../../application/dto/message.dto';

export class MessageAddedEvent {
  constructor(public readonly message: MessageDto) {}
} 