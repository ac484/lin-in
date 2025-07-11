import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface GlobalMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalMessageBusService {
  readonly bus = new Subject<GlobalMessage>();
  next(msg: GlobalMessage) { this.bus.next(msg); }
} 