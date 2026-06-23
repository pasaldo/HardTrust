import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:360px;margin:auto;">
      <h2>Login</h2>
      <form (ngSubmit)="submit($event)">
        <div>
          <label>Email</label>
          <input [(ngModel)]="email" name="email" />
        </div>
        <div>
          <label>Password</label>
          <input [(ngModel)]="password" name="password" type="password" />
        </div>
        <button type="submit" [disabled]="loading">Ingresar</button>
      </form>
      <p *ngIf="error" style="color:red;">{{ error }}</p>
      <p><a routerLink="/register">Crear cuenta</a></p>
    </div>
  `
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
