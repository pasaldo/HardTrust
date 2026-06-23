import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-demo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Prueba backend</h2>
      <form (ngSubmit)="send()">
        <input [(ngModel)]="payload.email" name="email" placeholder="email" />
        <input [(ngModel)]="payload.password" name="password" placeholder="password" type="password" />
        <input [(ngModel)]="payload.first_name" name="first_name" placeholder="nombre" />
        <input [(ngModel)]="payload.last_name" name="last_name" placeholder="apellido" />
        <button type="submit">Enviar</button>
      </form>
      <pre *ngIf="result">{{ result | json }}</pre>
    </div>
  `,
  styles: [
    '.card { padding: 16px; border: 1px solid #ddd; border-radius: 8px; max-width: 480px; } input { display: block; margin: 6px 0; }'
  ]
})
export class DemoFormComponent {
  payload: any = { email: '', password: '', first_name: '', last_name: '' };
  result: string | null = null;
  constructor(private api: ApiService) {}

  send() {
    this.api.register(this.payload).subscribe({
      next: (res) => (this.result = JSON.stringify(res)),
      error: (err) => (this.result = JSON.stringify(err.error ?? err))
    });
  }
}
