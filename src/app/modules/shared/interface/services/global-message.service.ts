import { Injectable, inject } from '@angular/core';
import { GlobalMessageBusService, GlobalMessage } from '../../../infrastructure/services/global-message-bus.service';

@Injectable({ providedIn: 'root' })
export class GlobalMessageService {
  private bus = inject(GlobalMessageBusService);
  show(msg: GlobalMessage) { this.bus.next(msg); }
  get messages$() { return this.bus.bus.asObservable(); }
} 