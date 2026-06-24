import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">Iniciar sesión</h2>
        <form (ngSubmit)="submit($event)" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input id="email" [(ngModel)]="email" name="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input id="password" [(ngModel)]="password" name="password" type="password" class="form-input" />
          </div>
          <button type="submit" class="auth-btn" [disabled]="loading">Ingresar</button>
        </form>
        <p *ngIf="error" class="auth-error">{{ error }}</p>
        <p class="auth-footer">
          ¿No tienes cuenta? <a routerLink="/register" class="auth-link">Crear cuenta</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 24px;
    }
    .auth-title {
      margin: 0 0 16px;
      font-size: 22px;
      font-weight: 700;
      color: #e2e8f0;
      letter-spacing: -0.3px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .form-input {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 14px;
      outline: none;
    }
    .form-input:focus {
      border-color: #2563eb;
    }
    .auth-btn {
      margin-top: 8px;
      padding: 10px 12px;
      border-radius: 10px;
      border: none;
      background: #2563eb;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s;
    }
    .auth-btn:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .auth-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .auth-error {
      margin-top: 12px;
      color: #f87171;
      font-size: 14px;
    }
    .auth-footer {
      margin-top: 14px;
      color: #94a3b8;
      font-size: 14px;
      text-align: center;
    }
    .auth-link {
      color: #60a5fa;
      text-decoration: none;
      font-weight: 600;
    }
    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email = ''
  password = ''
  loading = false
  error = ''
  constructor(private auth: AuthService, private router: Router) {}

  submit(e: Event) {
    e.preventDefault()
    this.loading = true
    this.error = ''
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveSession(res)
        this.router.navigateByUrl('/profile')
      },
      error: (err: any) => {
        this.error = err?.error?.detail || 'Error al iniciar sesión.'
      },
      complete: () => (this.loading = false)
    })
  }
}
