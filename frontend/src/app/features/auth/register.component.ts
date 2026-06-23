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
    <div style="max-width:420px;margin:auto;">
      <h2>Registro</h2>
      <form (ngSubmit)="submit($event)">
        <div>
          <label>Nombre</label>
          <input [(ngModel)]="first_name" name="first_name" />
        </div>
        <div>
          <label>Apellido</label>
          <input [(ngModel)]="last_name" name="last_name" />
        </div>
        <div>
          <label>RUT</label>
          <input [(ngModel)]="rut" name="rut" placeholder="20.522.298-8" />
        </div>
        <div>
          <label>Teléfono</label>
          <input [(ngModel)]="phone" name="phone" placeholder="+56 9 1234 5678" />
        </div>
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
