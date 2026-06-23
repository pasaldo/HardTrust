import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:360px;margin:auto;">
      <h2>Registro</h2>
      <form (ngSubmit)="submit($event)">
        <div>
          <label>Email</label>
          <input [(ngModel)]="email" name="email" />
        </div>
        <div>
          <label>Username</label>
          <input [(ngModel)]="username" name="username" />
        </div>
        <div>
          <label>Password</label>
          <input [(ngModel)]="password" name="password" type="password" />
        </div>
        <button type="submit" [disabled]="loading">Crear cuenta</button>
      </form>
      <p *ngIf="error" style="color:red;">{{ error }}</p>
      <p><a routerLink="/login">Ya tengo cuenta</a></p>
    </div>
  `
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  loading = false;
  error = '';
  constructor(private auth: AuthService, private router: Router) {}

  submit(e: Event) {
    e.preventDefault();
    this.loading = true;
    this.error = '';
    this.auth.register({ email: this.email, username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveSession(res);
        this.router.navigateByUrl('/listings');
      },
      error: (err: any) => {
        this.error = err?.error?.detail || 'Error al crear la cuenta.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
