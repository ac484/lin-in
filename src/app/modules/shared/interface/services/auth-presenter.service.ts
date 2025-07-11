import { Injectable, inject } from '@angular/core';
import { AuthApplicationService } from '../../application/services/auth-application.service';
import { LoginWithGoogleCommand } from '../../application/commands/login-with-google.command';
import { LoginWithEmailCommand } from '../../application/commands/login-with-email.command';
import { RegisterWithEmailCommand } from '../../application/commands/register-with-email.command';
import { LogoutCommand } from '../../application/commands/logout.command';

@Injectable({ providedIn: 'root' })
export class AuthPresenterService {
  private app = inject(AuthApplicationService);

  loginWithGoogle() {
    return this.app.loginWithGoogle(new LoginWithGoogleCommand());
  }
  loginWithEmail(email: string, password: string) {
    return this.app.loginWithEmail(new LoginWithEmailCommand(email, password));
  }
  registerWithEmail(email: string, password: string) {
    return this.app.registerWithEmail(new RegisterWithEmailCommand(email, password));
  }
  logout() {
    return this.app.logout(new LogoutCommand());
  }
} 