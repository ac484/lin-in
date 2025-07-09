import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'hub-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzButtonModule, NzInputModule, NzIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/hub']),
      error: err => {
        this.errorMessage = err.message || '登入失敗';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  onGoogleLogin() {
    this.loading = true;
    this.auth.googleLogin().subscribe({
      next: () => this.router.navigate(['/hub']),
      error: err => {
        this.errorMessage = err.message || 'Google 登入失敗';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
} 