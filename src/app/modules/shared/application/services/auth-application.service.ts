import { Injectable, inject } from '@angular/core';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { LoginWithGoogleCommand } from '../commands/login-with-google.command';
import { LoginWithEmailCommand } from '../commands/login-with-email.command';
import { RegisterWithEmailCommand } from '../commands/register-with-email.command';
import { LogoutCommand } from '../commands/logout.command';

@Injectable({ providedIn: 'root' })
export class AuthApplicationService {
  private domain = inject(AuthDomainService);

  loginWithGoogle(cmd: LoginWithGoogleCommand) {
    return this.domain.loginWithGoogle();
  }
  loginWithEmail(cmd: LoginWithEmailCommand) {
    return this.domain.loginWithEmail(cmd.email, cmd.password);
  }
  registerWithEmail(cmd: RegisterWithEmailCommand) {
    return this.domain.registerWithEmail(cmd.email, cmd.password);
  }
  logout(cmd: LogoutCommand) {
    return this.domain.logout();
  }
} 