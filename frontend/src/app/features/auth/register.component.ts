import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">Registro</h2>
        <form (ngSubmit)="submit($event)" class="auth-form">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input [(ngModel)]="first_name" name="first_name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Apellido</label>
            <input [(ngModel)]="last_name" name="last_name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">RUT</label>
            <input [(ngModel)]="rut" name="rut" placeholder="20.522.298-8" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input [(ngModel)]="phone" name="phone" placeholder="+56 9 1234 5678" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input [(ngModel)]="email" name="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input [(ngModel)]="username" name="username" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input [(ngModel)]="password" name="password" type="password" class="form-input" />
          </div>
          <button type="submit" class="auth-btn" [disabled]="loading">Crear cuenta</button>
        </form>
        <p *ngIf="error" class="auth-error">{{ error }}</p>
        <p class="auth-footer">
          ¿Ya tienes cuenta? <a routerLink="/login" class="auth-link">Iniciar sesión</a>
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
      max-width: 480px;
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
export class RegisterComponent {
  first_name = ''
  last_name = ''
  rut = ''
  phone = ''
  email = ''
  username = ''
  password = ''
  loading = false
  error = ''
  constructor(private auth: AuthService, private router: Router) {}

  submit(e: Event) {
    e.preventDefault()
    this.loading = true
    this.error = ''
    this.auth.register({
      first_name: this.first_name,
      last_name: this.last_name,
      rut: this.rut,
      phone: this.phone,
      email: this.email,
      username: this.username,
      password: this.password,
    }).subscribe({
      next: (res: any) => {
        this.auth.saveSession(res)
        this.router.navigateByUrl('/profile')
      },
      error: (err: any) => {
        this.error = err?.error?.detail || 'Error al crear la cuenta.'
      },
      complete: () => (this.loading = false)
    })
  }
}
