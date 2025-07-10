import { Subject } from 'rxjs';

export interface GlobalMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

export const globalMessageBus = new Subject<GlobalMessage>(); 