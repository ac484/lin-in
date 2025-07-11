import { Injectable, inject } from '@angular/core';
import { AuthDomainService } from '../../domain/services/auth-domain.service';

@Injectable({ providedIn: 'root' })
export class UserStreamService {
  private domain = inject(AuthDomainService);
  user$ = this.domain.user$;
} 