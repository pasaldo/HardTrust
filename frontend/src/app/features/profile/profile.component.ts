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
  hardware_type: string;
  brand: string;
  model: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClient],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <a routerLink="/listings" class="logo">HardTrust</a>
        <div class="nav-links">
          <a routerLink="/listings">Explorar</a>
          <a routerLink="/listings?category=1">CPU</a>
          <a routerLink="/listings?category=2">GPU</a>
          <a routerLink="/listings?category=3">RAM</a>
          <a routerLink="/listings?category=4">SSD</a>
          <a routerLink="/listings?category=5">HDD</a>
          <a routerLink="/listings?category=6">PSU</a>
          <a routerLink="/profile" class="nav-profile active">Mi perfil</a>
        </div>
      </div>
    </nav>

    <div class="page" *ngIf="user; else loading">
      <div class="profile-header-card">
        <div class="profile-banner"></div>
        <div class="profile-body">
          <div class="profile-avatar">{{ initials }}</div>
          <div class="profile-text">
            <h1>{{ user.first_name }} {{ user.last_name }}</h1>
            <p class="profile-email">{{ user.email }}</p>
            <div class="profile-tags">
              <span class="tag">RUT: {{ user.rut }}</span>
              <span class="tag">Teléfono: {{ user.phone }}</span>
              <span class="tag reputation-tag">
                Reputación: ★ {{ user.reputation?.toFixed(1) || '0.0' }} / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="tabs-nav">
        <button (click)="tab = 'listings'" [class.active]="tab === 'listings'">
          Mis publicaciones
        </button>
        <button (click)="tab = 'saved'" [class.active]="tab === 'saved'">
          Guardados
        </button>
        <button (click)="tab = 'messages'" [class.active]="tab === 'messages'">
          Mensajes
        </button>
      </div>

      <div class="tab-content">
        <section *ngIf="tab === 'listings'">
          <div class="grid" *ngIf="myListings.length; else noListings">
            <article class="listing-card" *ngFor="let l of myListings">
              <a [routerLink]="['/listings', l.id]">
                <div class="card-image">
                  <img *ngIf="l.images?.length; else noImg" [src]="l.images[0]" [alt]="l.title" />
                  <ng-template #noImg>
                    <div class="no-image">Sin imagen</div>
                  </ng-template>
                  <span class="status-chip" [class.pending]="l.status === 'PENDING'" [class.active]="l.status === 'ACTIVE'">
                    {{ l.status }}
                  </span>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ l.title }}</h3>
                  <p class="card-brand">{{ l.brand }} {{ l.model }}</p>
                  <p class="card-price">${{ l.price }}</p>
                </div>
              </a>
            </article>
          </div>
          <ng-template #noListings>
            <div class="empty-state">
              <p>No tienes publicaciones activas.</p>
              <a routerLink="/listings" class="cta-link">Publicar ahora</a>
            </div>
          </ng-template>
        </section>

        <section *ngIf="tab === 'saved'" class="empty-state">
          <p>Sección de publicaciones guardadas.</p>
        </section>

        <section *ngIf="tab === 'messages'" class="empty-state">
          <p>Sección de mensajes.</p>
        </section>
      </div>
    </div>

    <ng-template #loading>
      <div class="page">
        <div class="skeleton-card">
          <div class="sk-avatar"></div>
          <div class="sk-lines">
            <div class="sk-line sk-title"></div>
            <div class="sk-line sk-text"></div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
    }
    .nav-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .nav-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.15s;
    }
    .nav-links a:hover {
      color: #fff;
    }
    .nav-profile {
      padding: 8px 18px;
      border-radius: 10px;
      background: #1e293b;
      color: #fff;
      border: 1px solid #334155;
    }
    .nav-profile.active {
      background: #2563eb;
      border-color: #2563eb;
    }

    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
    .profile-header-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .profile-banner {
      height: 120px;
      background: linear-gradient(120deg, #1e293b 0%, #0f172a 100%);
    }
    .profile-body {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 0 28px 24px;
      margin-top: -48px;
    }
    .profile-avatar {
      width: 96px;
      height: 96px;
      border-radius: 999px;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 34px;
      border: 4px solid #0f172a;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    }
    .profile-text h1 {
      margin: 0;
      font-size: 24px;
      color: #f1f5f9;
    }
    .profile-email {
      color: #94a3b8;
      margin: 4px 0 10px;
      font-size: 14px;
    }
    .profile-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tag {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }
    .reputation-tag {
      background: #1e293b;
      color: #facc15;
      border-color: #854d0e;
    }

    .tabs-nav {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid #1e293b;
      margin-bottom: 20px;
    }
    .tabs-nav button {
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      transition: color 0.15s;
    }
    .tabs-nav button:hover {
      color: #e2e8f0;
    }
    .tabs-nav button.active {
      color: #fff;
    }
    .tabs-nav button.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #2563eb;
      border-radius: 2px 2px 0 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    .listing-card {
      border: 1px solid #1e293b;
      border-radius: 14px;
      overflow: hidden;
      background: #0f172a;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .listing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
      border-color: #334155;
    }
    .listing-card a {
      text-decoration: none;
      color: inherit;
    }
    .card-image {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 11;
      background: #1e293b;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 14px;
    }
    .status-chip {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #854d0e;
      color: #fef08a;
    }
    .status-chip.pending {
      background: #854d0e;
      color: #fef08a;
    }
    .status-chip.active {
      background: #14532d;
      color: #86efac;
    }
    .card-body {
      padding: 14px;
    }
    .card-title {
      margin: 0 0 6px;
      font-size: 15px;
      color: #e2e8f0;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-brand {
      margin: 0 0 8px;
      font-size: 13px;
      color: #64748b;
    }
    .card-price {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: #fff;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }
    .cta-link {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 20px;
      background: #2563eb;
      color: #fff;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.15s;
    }
    .cta-link:hover {
      background: #1d4ed8;
    }

    .skeleton-card {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .sk-avatar {
      width: 96px;
      height: 96px;
      border-radius: 999px;
      background: #1e293b;
    }
    .sk-lines {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sk-line {
      height: 14px;
      border-radius: 6px;
      background: #1e293b;
    }
    .sk-title {
      height: 24px;
      width: 260px;
      background: #334155;
    }
    .sk-text {
      width: 200px;
    }

    @media (max-width: 640px) {
      .profile-body {
        flex-direction: column;
        text-align: center;
      }
      .profile-tags {
        justify-content: center;
      }
      .grid {
        grid-template-columns: 1fr;
      }
    }
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
