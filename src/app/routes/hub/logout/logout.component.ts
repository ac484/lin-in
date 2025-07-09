import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'hub-logout',
  standalone: true,
  template: `<div class="flex items-center justify-center min-h-screen"><p>正在登出...</p></div>`
})
export class LogoutComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}
  ngOnInit() {
    this.auth.logout().subscribe();
  }
} 