import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
interface Listing {
  id: number;
  title: string;
  price: string;
  status: string;
  risk_level: string;
  images: string[];
  category: number;
  category_name: string;
  hardware_type: string;
  brand: string;
  model: string;
  description: string;
  seller_name: string;
  seller_reputation: number;
}

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
          <a routerLink="/profile" class="nav-profile">Mi perfil</a>
        </div>
      </div>
    </nav>

    <div class="page" *ngIf="listing as item; else loading">
      <div class="breadcrumb">
        <a routerLink="/listings">Inicio</a>
        <span class="separator">/</span>
        <span>{{ item.title }}</span>
      </div>

      <div class="product-layout">
        <div class="gallery">
          <div class="main-image">
            <img
              *ngIf="listing as item; else noImage"
              [src]="resolveSrc(item)"
              [alt]="item.title"
            />
            <ng-template #noImage>
              <div class="no-image"><span>Sin imagen</span></div>
            </ng-template>
          </div>
          <div class="thumbnails" *ngIf="listing && listing.images && listing.images.length > 1">
              <img
                *ngFor="let img of listing.images"
                [src]="resolveSrc(item, img)"
                [alt]="listing.title"
                class="thumb"
              />
            </div>
        </div>

        <div class="product-info">
          <div class="product-main">
            <h1 class="product-title">{{ item.title }}</h1>
            <div class="product-meta-row">
              <span class="badge category-badge">{{ item.category_name }}</span>
              <span class="badge condition-badge">{{ item.hardware_type }}</span>
              <span class="badge state-badge" [class.pending]="item.status === 'PENDING'" [class.active]="item.status === 'ACTIVE' || item.status === 'APPROVED_BY_ML'">
                {{ statusLabel(item.status) }}
              </span>
            </div>
            <h2 class="product-price">{{ formatPrice(item.price) }} CLP</h2>
            <p class="product-desc">{{ item.description }}</p>

            <div class="specs-card">
              <h3>Especificaciones</h3>
              <div class="specs-grid">
                <div class="spec-item">
                  <span class="spec-label">Marca</span>
                  <span class="spec-value">{{ item.brand }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Modelo</span>
                  <span class="spec-value">{{ item.model }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Categoría</span>
                  <span class="spec-value">{{ item.category_name }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Tipo</span>
                  <span class="spec-value">{{ item.hardware_type }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="seller-card">
            <div class="seller-avatar">
              {{ initials }}
            </div>
            <div class="seller-info">
              <h4>{{ item.seller_name }}</h4>
              <div class="reputation-row">
                <span class="reputation-stars">{{ stars }}</span>
                <span class="reputation-text">{{ item.seller_reputation.toFixed(1) }} / 5.0</span>
              </div>
            </div>
            <button class="contact-btn">Contactar vendedor</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="page">
        <div class="skeleton">
          <div class="sk-image"></div>
          <div class="sk-lines">
            <div class="sk-line sk-title"></div>
            <div class="sk-line sk-text"></div>
            <div class="sk-line sk-text short"></div>
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

    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #64748b;
    }
    .breadcrumb a {
      color: #64748b;
      text-decoration: none;
    }
    .breadcrumb a:hover {
      color: #e2e8f0;
    }
    .separator {
      color: #475569;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    .gallery {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .main-image {
      width: 100%;
      aspect-ratio: 16 / 11;
      border-radius: 16px;
      overflow: hidden;
      background: #1e293b;
      border: 1px solid #334155;
    }
    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .thumbnails {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .thumb {
      width: 72px;
      height: 72px;
      object-fit: contain;
      border-radius: 10px;
      border: 2px solid #334155;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .thumb:hover {
      border-color: #60a5fa;
    }
    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1e293b;
      color: #64748b;
      font-size: 15px;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .product-title {
      font-size: 26px;
      font-weight: 800;
      color: #000;
      margin: 0;
      line-height: 1.3;
      letter-spacing: -0.3px;
      background: #fff;
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .product-meta-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0;
    }
    .badge {
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .category-badge {
      background: #1e40af;
      color: #bfdbfe;
    }
    .condition-badge {
      background: #166534;
      color: #bbf7d0;
    }
    .state-badge {
      background: #854d0e;
      color: #fef08a;
    }
    .state-badge.pending {
      background: #854d0e;
      color: #fef08a;
    }
    .state-badge.active {
      background: #14532d;
      color: #86efac;
    }

    .product-price {
      font-size: 32px;
      font-weight: 800;
      color: #000;
      margin: 0;
      background: #fff;
      padding: 12px 18px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      display: inline-block;
    }
    .product-desc {
      color: #e2e8f0;
      white-space: pre-wrap;
      line-height: 1.6;
      font-size: 15px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 16px;
    }

    .specs-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 18px;
    }
    .specs-card h3 {
      margin: 0 0 14px;
      font-size: 15px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .spec-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
    }
    .spec-value {
      font-size: 14px;
      color: #e2e8f0;
      font-weight: 500;
    }

    .seller-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: sticky;
      top: 90px;
    }
    .seller-avatar {
      width: 52px;
      height: 52px;
      border-radius: 999px;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20px;
    }
    .seller-info h4 {
      margin: 0;
      font-size: 16px;
      color: #f1f5f9;
    }
    .reputation-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .reputation-stars {
      color: #facc15;
      font-size: 16px;
      letter-spacing: 1px;
    }
    .reputation-text {
      font-size: 13px;
      color: #94a3b8;
    }
    .contact-btn {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: #2563eb;
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .contact-btn:hover {
      background: #1d4ed8;
    }

    .skeleton {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
    }
    .sk-image {
      width: 100%;
      aspect-ratio: 16 / 11;
      border-radius: 16px;
      background: #1e293b;
    }
    .sk-lines {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 10px;
    }
    .sk-line {
      height: 14px;
      border-radius: 6px;
      background: #1e293b;
    }
    .sk-title {
      height: 24px;
      width: 80%;
      background: #334155;
    }
    .sk-text.short {
      width: 50%;
    }

    @media (max-width: 900px) {
      .product-layout {
        grid-template-columns: 1fr;
      }
      .seller-card {
        position: static;
      }
    }
  `]
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;

  formatPrice(price: string | number): string {
    const numeric = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numeric)) return '$0';
    const clp = Math.round(numeric);
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(clp);
  }

  statusLabel(status: string): string {
    const key = (status || '').toUpperCase();
    if (key === 'APPROVED_BY_ML') return 'aprobado';
    if (key === 'PENDING') return 'pendiente';
    return status;
  }

  resolveSrc(listing: Listing, overrideSrc?: string): string {
    const raw = overrideSrc ?? listing?.images?.[0] ?? '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    const name = raw.split('/').pop() || '';
    if (name) {
      return `http://127.0.0.1:8000/api/listings/assets/listings/${encodeURIComponent(name)}`;
    }
    const baseName = (listing?.title || '')
      .toString()
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    return `http://127.0.0.1:8000/api/listings/assets/listings/${encodeURIComponent(baseName + '.png')}`;
  }

  get initials(): string {
    const name = this.listing?.seller_name || '';
    const parts = name.trim().split(' ');
    const first = parts[0] ? parts[0][0] : '';
    const last = parts[1] ? parts[1][0] : '';
    return (first + last).toUpperCase() || '?';
  }

  get stars(): string {
    const rep = this.listing?.seller_reputation ?? 0;
    const full = Math.floor(rep);
    const half = rep - full >= 0.5;
    const stars = '★'.repeat(full) + (half ? '½' : '');
    return stars || '☆';
  }

  private base = 'http://127.0.0.1:8000/api/listings';
  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.http.get<Listing>(`${this.base}/listings/${id}/`).subscribe({
      next: (data: any) => {
        this.listing = {
          ...data,
          hardware_type: data.hardware_type || 'N/A',
          brand: data.brand || 'N/A',
          model: data.model || 'N/A',
          description: data.description || 'Sin descripción.',
          category_name: data.category_name || `Cat. ${data.category}`
        };
      },
      error: (err: any) => console.error(err)
    });
  }
}
