import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import { SidenavComponent } from '../../shared/components/sidenav/sidenav.component';

@Component({
  selector: 'app-basic',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    UserAvatarComponent,
    SidenavComponent
  ],
  template: `
    <mat-toolbar color="primary" style="position:fixed;top:0;left:64px;right:0;z-index:1000;">
      <span style="flex:1 1 auto;"></span>
      <app-user-avatar />
    </mat-toolbar>
    <div style="display:flex;min-height:100vh;">
      <aside style="width:64px;background:#f5f5f5;box-shadow:1px 0 4px #0001;display:flex;flex-direction:column;align-items:center;position:fixed;top:0;left:0;bottom:0;">
        <app-sidenav />
      </aside>
      <main style="flex:1;margin-left:64px;padding-top:64px;">
        <router-outlet />
      </main>
    </div>
  `
})
export class BasicComponent {}
