import { Injectable, inject } from '@angular/core';
import { FirebaseAuthProvider } from '../../infrastructure/external-services/firebase-auth.provider';

@Injectable({ providedIn: 'root' })
export class AuthDomainService {
  private provider = inject(FirebaseAuthProvider);

  loginWithGoogle() {
    return this.provider.loginWithGoogle();
  }
  loginWithEmail(email: string, password: string) {
    return this.provider.loginWithEmail(email, password);
  }
  registerWithEmail(email: string, password: string) {
    return this.provider.registerWithEmail(email, password);
  }
  logout() {
    return this.provider.logout();
  }
  user$ = this.provider.user$;
} 