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
  imports: [CommonModule, RouterModule, FormsModule, HttpClient],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <a routerLink="/listings" class="logo">HardTrust</a>
        <div class="nav-links">
          <a routerLink="/listings">Inicio</a>
          <a routerLink="/listings?category=1">CPU</a>
          <a routerLink="/listings?category=2">GPU</a>
          <a routerLink="/listings?category=3">RAM</a>
          <a routerLink="/listings?category=4">SSD</a>
          <a routerLink="/listings?category=5">HDD</a>
          <a routerLink="/listings?category=6">PSU</a>
          <a routerLink="/profile" class="nav-profile">Mi perfil</a>
        </div>
      </div>
    </nav>

    <header class="hero">
      <div class="hero-content">
        <h1>Marketplace de hardware de PC</h1>
        <p>Compra y vende componentes usados con confianza</p>
        <div class="search-bar">
          <input [(ngModel)]="search" placeholder="Buscar por nombre, marca o modelo..." />
          <button (click)="refresh()">Buscar</button>
        </div>
      </div>
    </header>

    <section class="page">
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">Categoria</label>
          <select (change)="onCategoryChange($event)">
            <option value="">Todas</option>
            <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Tipo de hardware</label>
          <select (change)="onHardwareChange($event)">
            <option value="">Cualquiera</option>
            <option value="cpu">CPU</option>
            <option value="gpu">GPU</option>
            <option value="ram">RAM</option>
            <option value="ssd">SSD</option>
            <option value="hdd">HDD</option>
            <option value="psu">PSU</option>
            <option value="motherboard">Placa madre</option>
            <option value="cooler">Refrigeracion</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Marca</label>
          <select [(ngModel)]="brand">
            <option value="">Cualquier marca</option>
            <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Modelo</label>
          <input [(ngModel)]="model" placeholder="Ej: RTX 3070" />
        </div>
        <div class="filter-group">
          <label class="filter-label">Precio minimo</label>
          <input type="number" [(ngModel)]="minPrice" placeholder="$0" />
        </div>
        <div class="filter-group">
          <label class="filter-label">Precio maximo</label>
          <input type="number" [(ngModel)]="maxPrice" placeholder="$999.999" />
        </div>
        <button class="filter-btn" (click)="refresh()">Filtrar</button>
      </div>

      <div class="results-info" *ngIf="listings.length">
        <span class="results-count">{{ listings.length }} resultado{{ listings.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="grid">
        <article class="listing-card" *ngFor="let l of listings">
          <a [routerLink]="['/listings', l.id]">
            <div class="card-image">
              <img *ngIf="l.images?.length; else placeholderImg" [src]="l.images[0]" [alt]="l.title" />
              <ng-template #placeholderImg>
                <div class="placeholder-image">Sin imagen</div>
              </ng-template>
              <span class="card-badge" [class.pending]="l.status === 'PENDING'" [class.active]="l.status === 'ACTIVE'">
                {{ l.status }}
              </span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ l.title }}</h3>
              <p class="card-brand">{{ l.brand }} {{ l.model }}</p>
              <div class="card-footer-row">
                <span class="card-price">${{ l.price }}</span>
                <span class="card-chip">{{ l.hardware_type }}</span>
              </div>
            </div>
          </a>
        </article>
      </div>

      <div class="empty-state" *ngIf="!listings.length && !hasFilters">
        <p>No hay publicaciones aun. Se el primero en publicar!</p>
      </div>
      <div class="empty-state" *ngIf="hasFilters && !listings.length">
        <p>No se encontraron resultados con los filtros seleccionados.</p>
      </div>
    </section>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      backdrop-filter: blur(10px);
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
    .nav-links a:hover,
    .nav-links a.active {
      color: #fff;
    }
    .nav-profile {
      padding: 8px 18px;
      border-radius: 10px;
      background: #1e293b;
      color: #fff;
      border: 1px solid #334155;
    }

    .hero {
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      padding: 48px 24px 40px;
      text-align: center;
      border-bottom: 1px solid #1e293b;
    }
    .hero-content h1 {
      margin: 0;
      font-size: 32px;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .hero-content p {
      margin: 8px 0 24px;
      color: #94a3b8;
      font-size: 15px;
    }
    .search-bar {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 6px 6px 6px 14px;
      max-width: 560px;
      width: 100%;
    }
    .search-bar input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #e2e8f0;
      font-size: 15px;
      padding: 10px 0;
    }
    .search-bar button {
      padding: 10px 22px;
      border-radius: 10px;
      border: none;
      background: #2563eb;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .search-bar button:hover {
      background: #1d4ed8;
    }

    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
    .filters-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 24px;
      background: #0f172a;
      padding: 18px;
      border-radius: 14px;
      border: 1px solid #1e293b;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filter-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.4px;
    }
    .filters-bar select,
    .filters-bar input {
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #e2e8f0;
      font-size: 14px;
      min-width: 140px;
    }
    .filter-btn {
      padding: 9px 22px;
      border-radius: 10px;
      border: none;
      background: #2563eb;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .filter-btn:hover {
      background: #1d4ed8;
    }

    .results-info {
      margin-bottom: 14px;
    }
    .results-count {
      font-size: 13px;
      color: #64748b;
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
      box-shadow: 0 12px 28px rgba(0,0,0,0.3);
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
      overflow: hidden;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }
    .listing-card:hover .card-image img {
      transform: scale(1.05);
    }
    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 14px;
    }
    .card-badge {
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
    .card-badge.pending {
      background: #854d0e;
      color: #fef08a;
    }
    .card-badge.active {
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
      margin: 0 0 10px;
      font-size: 13px;
      color: #64748b;
    }
    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .card-price {
      font-size: 17px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .card-chip {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
    }
    .empty-state {
      text-align: center;
      padding: 48px 20px;
      color: #64748b;
      font-size: 15px;
    }
  `]
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  categories: any[] = [];
  brands: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  category = '';
  hardware = '';
  brand = '';
  model = '';
  search = '';
  get hasFilters() {
    return !!(
      this.category ||
      this.hardware ||
      this.brand ||
      this.model ||
      this.minPrice != null ||
      this.maxPrice != null ||
      this.search
    );
  }
  private base = 'http://127.0.0.1:8000/api/listings';
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.base}/categories/`).subscribe({
      next: (data) => (this.categories = data || []),
      error: (err) => console.error(err)
    });
    this.http.get<string[]>(`${this.base}/brands/`).subscribe({
      next: (data) => (this.brands = data || []),
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
    if (this.category) {
      params.push(`category=${this.category}`);
    }
    if (this.hardware) {
      params.push(`hardware_type=${this.hardware}`);
    }
    if (this.brand) {
      params.push(`brand=${encodeURIComponent(this.brand)}`);
    }
    if (this.model) {
      params.push(`model=${encodeURIComponent(this.model)}`);
    }
    if (this.minPrice != null) {
      params.push(`min_price=${this.minPrice}`);
    }
    if (this.maxPrice != null) {
      params.push(`max_price=${this.maxPrice}`);
    }
    if (this.search) {
      params.push(`search=${encodeURIComponent(this.search)}`);
    }
    const qs = params.length ? '?' + params.join('&') : '';
    this.http.get<any[]>(`${this.base}/browse/${qs}`).subscribe({
      next: (data) => (this.listings = data || []),
      error: (err) => console.error(err)
    });
  }
}
