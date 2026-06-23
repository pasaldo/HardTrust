import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: string;
  status: string;
  risk_level: string;
  images: string[];
  category: number;
  hardware_type: string;
  brand: string;
  model: string;
  seller: number;
  seller_name: string;
  seller_reputation: number;
}

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="topbar">
      <a routerLink="/listings" class="brand">HardTrust</a>
      <a routerLink="/listings" routerLinkActive="active">Inicio</a>
      <a routerLink="/listings?category=1" routerLinkActive="active">CPU</a>
      <a routerLink="/listings?category=2" routerLinkActive="active">GPU</a>
      <a routerLink="/listings?category=3" routerLinkActive="active">RAM</a>
      <a routerLink="/listings?category=4" routerLinkActive="active">SSD</a>
      <a routerLink="/listings?category=5" routerLinkActive="active">HDD</a>
      <a routerLink="/listings?category=6" routerLinkActive="active">PSU</a>
      <a routerLink="/profile" class="profile">Mi perfil</a>
    </nav>
    <header class="hero">
      <h1>HardTrust</h1>
      <p>Marketplace de hardware de PC de segunda mano</p>
      <div class="search-bar">
        <input [(ngModel)]="search" placeholder="Buscar por nombre, marca o modelo..." />
        <button (click)="refresh()">Buscar</button>
      </div>
    </header>

    <section class="filters">
      <select (change)="onCategoryChange($event)">
        <option value="">Todas las categorías</option>
        <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
      </select>
      <select (change)="onHardwareChange($event)">
        <option value="">Cualquier tipo</option>
        <option value="cpu">CPU</option>
        <option value="gpu">GPU</option>
        <option value="ram">RAM</option>
        <option value="ssd">SSD</option>
        <option value="hdd">HDD</option>
        <option value="psu">PSU</option>
        <option value="motherboard">Placa madre</option>
        <option value="cooler">Refrigeración</option>
      </select>
      <input type="number" [(ngModel)]="minPrice" placeholder="Precio mínimo" />
      <input type="number" [(ngModel)]="maxPrice" placeholder="Precio máximo" />
      <button (click)="refresh()">Filtrar</button>
    </section>

    <main class="grid">
      <article class="card" *ngFor="let l of listings">
        <a [routerLink]="['/listings', l.id]">
          <img *ngIf="l.images?.length; else placeholderImg" [src]="l.images[0]" [alt]="l.title" />
          <ng-template #placeholderImg>
            <div class="placeholder-img">Sin imagen</div>
          </ng-template>
          <div class="meta">
            <h3>{{ l.title }}</h3>
            <p class="brand">{{ l.brand }} {{ l.model }}</p>
            <p class="price">${{ l.price }}</p>
            <p class="status">{{ l.status }} · Riesgo: {{ l.risk_level }}</p>
            <p class="seller">Vendedor: {{ l.seller_name }} (Rep: {{ l.seller_reputation }})</p>
          </div>
        </a>
      </article>
    </main>

    <ng-template #empty>
      <p class="empty">No hay publicaciones disponibles.</p>
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
    .profile { margin-left: auto; }

    .hero {
      text-align: center;
      padding: 28px 16px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }
    .hero h1 { margin: 0; }
    .search-bar {
      margin-top: 10px;
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .search-bar input { width: 320px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .search-bar button { padding: 8px 12px; border: none; background: #111827; color: #fff; border-radius: 6px; }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px;
    }
    .filters input, .filters select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .filters button { padding: 8px 12px; border: none; background: #111827; color: #fff; border-radius: 6px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 16px;
      padding: 16px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      transition: transform .15s ease;
    }
    .card:hover { transform: translateY(-4px); }
    .card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #e2e8f0;
    }
    .placeholder-img {
      height: 180px;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }
    .meta { padding: 12px; }
    .meta h3 { margin: 0 0 6px; font-size: 16px; }
    .brand { color: #475569; margin: 0 0 6px; }
    .price { font-weight: 700; color: #0f172a; margin: 0 0 6px; }
    .status { color: #64748b; margin: 0 0 4px; }
    .seller { color: #334155; margin: 0; font-size: 13px; }
    .empty { text-align: center; padding: 36px; color: #6b7280; }
  `]
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  categories: any[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  category = '';
  hardware = '';
  search = '';
  private base = 'http://127.0.0.1:8000/api/listings';
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.base}/categories/`).subscribe({
      next: (data) => (this.categories = data || []),
      error: (err) => console.error(err)
    });
    this.refresh();
  }

  onCategoryChange(ev: Event) {
    const select = ev.target as HTMLSelectElement;
    this.category = select.value;
    this.refresh();
  }

  onHardwareChange(ev: Event) {
    const select = ev.target as HTMLSelectElement;
    this.hardware = select.value;
    this.refresh();
  }

  refresh() {
    const params: string[] = [];
    if (this.category) params.push(`category=${this.category}`);
    if (this.hardware) params.push(`hardware_type=${this.hardware}`);
    if (this.minPrice != null && this.minPrice !== '') params.push(`min_price=${this.minPrice}`);
    if (this.maxPrice != null && this.maxPrice !== '') params.push(`max_price=${this.maxPrice}`);
    if (this.search) params.push(`search=${encodeURIComponent(this.search)}`);
    const qs = params.length ? '?' + params.join('&') : '';
    this.http.get<any[]>(`${this.base}/browse/${qs}`).subscribe({
      next: (data) => (this.listings = data || []),
      error: (err) => console.error(err)
    });
  }
}
