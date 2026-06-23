import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Listing {
  id: number;
  title: string;
  price: string;
  status: string;
  risk_level: string;
  images: string[];
  created_at: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClient],
  template: `
    <nav class="topbar">
      <a routerLink="/listings" class="brand">HardTrust</a>
      <a routerLink="/listings" routerLinkActive="active">Inicio</a>
      <a routerLink="/profile" routerLinkActive="active">Mi perfil</a>
    </nav>

    <section class="container" *ngIf="user; else loading">
      <header class="profile-header">
        <div class="avatar">{{ initials }}</div>
        <div class="info">
          <h1>{{ user.first_name }} {{ user.last_name }}</h1>
          <p>{{ user.email }}</p>
          <p>RUT: {{ user.rut }} · Teléfono: {{ user.phone }}</p>
          <p>Reputación: {{ user.reputation }}</p>
        </div>
      </header>

      <nav class="tabs">
        <button (click)="tab = 'listings'" [class.active]="tab === 'listings'">Mis publicaciones</button>
        <button (click)="tab = 'saved'" [class.active]="tab === 'saved'">Guardados</button>
        <button (click)="tab = 'messages'" [class.active]="tab === 'messages'">Mensajes</button>
      </nav>

      <ng-container [ngSwitch]="tab">
        <section class="panel" *ngSwitchCase="'listings'">
          <h2>Mis publicaciones</h2>
          <div class="grid">
            <article class="card" *ngFor="let l of myListings">
              <a [routerLink]="['/listings', l.id]">
                <img *ngIf="l.images?.length" [src]="l.images[0]" [alt]="l.title" />
                <div class="meta">
                  <h3>{{ l.title }}</h3>
                  <p class="price">${{ l.price }}</p>
                  <p class="status">{{ l.status }} · {{ l.risk_level }}</p>
                </div>
              </a>
            </article>
          </div>
          <p class="empty" *ngIf="!myListings.length">No tienes publicaciones activas.</p>
        </section>

        <section class="panel" *ngSwitchCase="'saved'">
          <h2>Publicaciones guardadas</h2>
          <p class="empty">Sección pendiente de implementar.</p>
        </section>

        <section class="panel" *ngSwitchCase="'messages'">
          <h2>Mensajes</h2>
          <p class="empty">Sección pendiente de implementar.</p>
        </section>
      </ng-container>
    </section>

    <ng-template #loading>
      <p class="empty">Cargando perfil...</p>
    </ng-template>
  `,
  styles: [`
    .topbar {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      background: #111827;
      color: #fff;
      align-items: center;
    }
    .topbar a { color: #fff; text-decoration: none; font-weight: 500; }
    .brand { font-size: 18px; font-weight: 700; }

    .container { max-width: 1000px; margin: 0 auto; padding: 16px; }
    .profile-header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .avatar { width: 64px; height: 64px; border-radius: 999px; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; }
    .info h1 { margin: 0; }
    .info p { margin: 4px 0; color: #334155; }

    .tabs { display: flex; gap: 8px; margin-bottom: 12px; }
    .tabs button { padding: 8px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; }
    .tabs button.active { background: #111827; color: #fff; border-color: #111827; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; }
    .card img { width: 100%; height: 160px; object-fit: cover; background: #e2e8f0; }
    .meta { padding: 10px; }
    .price { font-weight: 700; color: #0f172a; }
    .status { color: #64748b; }
    .empty { text-align: center; padding: 28px; color: #6b7280; }
  `]
})
export class ProfileComponent implements OnInit {
  tab = 'listings';
  user: any = null;
  myListings: Listing[] = [];
  get initials() {
    const fn = (this.user?.first_name || '').charAt(0).toUpperCase();
    const ln = (this.user?.last_name || '').charAt(0).toUpperCase();
    return `${fn}${ln}`;
  }
  private base = 'http://127.0.0.1:8000/api/users';
  private listingsBase = 'http://127.0.0.1:8000/api/listings';
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${this.base}/profile/`).subscribe({
      next: (data) => {
        this.user = data;
        this.http.get<any[]>(`${this.listingsBase}/listings/?seller=${data.id}`).subscribe({
          next: (items) => (this.myListings = items || []),
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }
}
