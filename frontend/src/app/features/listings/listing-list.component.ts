import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../core/services/search.service';
import { AuthService } from '../../core/services/auth.service';

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
    <section class="page">
      <ng-container *ngIf="!specializedCategory; else specialized">
        <div class="home-hero" *ngIf="!hasFilters">
          <div class="hero-inner">
            <h1 class="hero-title">Hardware de PC usado, con confianza</h1>
            <p class="hero-subtitle">Buyers Protection en cada compra. Vende y compra CPUs, GPUs, RAM, SSDs y más.</p>
          </div>
        </div>

        <!-- MAS BUSCADOS (scroll horizontal) -->
        <div class="section" *ngIf="!hasFilters">
          <div class="section-header">
            <h3 class="section-title">Más buscados</h3>
            <a routerLink="/listings" class="section-link">Ver todo</a>
          </div>
          <div class="section-scroll">
            <article class="listing-card compact" *ngFor="let l of mostWanted">
              <a [routerLink]="['/listings', l.id]">
                <div class="card-image">
                  <img *ngIf="l.images?.length; else placeholderImg" [src]="resolveSrc(l)" [alt]="l.title" />
                  <ng-template #placeholderImg>
                    <div class="placeholder-image">Sin imagen</div>
                  </ng-template>
                  <span class="card-badge" [class.risk-low]="riskLevel(l) === 'Bajo'" [class.risk-medium]="riskLevel(l) === 'Medio'" [class.risk-high]="riskLevel(l) === 'Alto'">
                    {{ riskLabel(l.risk_level || l.status) }}
                  </span>
                  <div class="card-badges-extra">
                    <span class="card-badge-verified">Vendedor verificado</span>
                    <span class="card-shipping">Envio gratis</span>
                  </div>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ l.title }}</h3>
                  <p class="card-brand">{{ l.brand }} {{ l.model }}</p>
                  <div class="card-footer-row">
                    <span class="card-price">{{ formatPrice(l.price) }}</span>
                    <span class="card-chip">{{ l.hardware_type }}</span>
                  </div>
                </div>
              </a>
            </article>
          </div>
        </div>

        <!-- OFERTAS (scroll horizontal) -->
        <div class="section" *ngIf="!hasFilters">
          <div class="section-header">
            <h3 class="section-title">Ofertas</h3>
            <a routerLink="/listings" class="section-link">Ver todo</a>
          </div>
          <div class="section-scroll">
            <article class="listing-card compact" *ngFor="let l of deals">
              <a [routerLink]="['/listings', l.id]">
                <div class="card-badge-offer">-12%</div>
                <div class="card-image">
                  <img *ngIf="l.images?.length; else placeholderImg2" [src]="resolveSrc(l)" [alt]="l.title" />
                  <ng-template #placeholderImg2>
                    <div class="placeholder-image">Sin imagen</div>
                  </ng-template>
                  <span class="card-badge" [class.risk-low]="riskLevel(l) === 'Bajo'" [class.risk-medium]="riskLevel(l) === 'Medio'" [class.risk-high]="riskLevel(l) === 'Alto'" style="top:8px;right:8px;">
                    {{ riskLabel(l.risk_level || l.status) }}
                  </span>
                  <div class="card-badges-extra">
                    <span class="card-badge-verified">Vendedor verificado</span>
                    <span class="card-shipping">Envio gratis</span>
                  </div>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ l.title }}</h3>
                  <p class="card-brand">{{ l.brand }} {{ l.model }}</p>
                  <div class="card-footer-row">
                    <span class="card-price">{{ formatPrice(l.price) }}</span>
                    <span class="card-chip">{{ l.hardware_type }}</span>
                  </div>
                </div>
              </a>
            </article>
          </div>
        </div>

        <!-- FILTROS -->
        <div class="filters-bar-horizontal" *ngIf="hasFilters">
          <div class="filter-group">
            <label class="filter-label">Categoria</label>
            <select [(ngModel)]="category" (change)="refresh()">
              <option value="">Todas</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Marca</label>
            <select [(ngModel)]="brand" (change)="refresh()">
              <option value="">Cualquier marca</option>
              <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Modelo</label>
            <input [(ngModel)]="model" (change)="refresh()" placeholder="Ej: RTX 3070" />
          </div>
          <div class="filter-group">
            <label class="filter-label">Precio minimo</label>
            <input type="number" [(ngModel)]="minPrice" (change)="refresh()" placeholder="$0" />
          </div>
          <div class="filter-group">
            <label class="filter-label">Precio maximo</label>
            <input type="number" [(ngModel)]="maxPrice" (change)="refresh()" placeholder="$999.999" />
          </div>
          <button class="filter-btn" (click)="refresh()">Filtrar</button>
        </div>

        <!-- GRID DE RESULTADOS (cuando hay filtros o búsqueda) -->
        <div class="results-info" *ngIf="listings.length && hasFilters">
          <span class="results-count">{{ listings.length }} resultado{{ listings.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="grid wide" *ngIf="!specializedCategory && listings.length">
          <article class="listing-card" *ngFor="let l of listings">
            <a [routerLink]="['/listings', l.id]">
              <div class="card-image">
                <img *ngIf="l.images?.length; else placeholderImg3" [src]="resolveSrc(l)" [alt]="l.title" />
                <ng-template #placeholderImg3>
                  <div class="placeholder-image">Sin imagen</div>
                </ng-template>
                <span class="card-badge" [class.risk-low]="riskLevel(l) === 'Bajo'" [class.risk-medium]="riskLevel(l) === 'Medio'" [class.risk-high]="riskLevel(l) === 'Alto'">
                  {{ riskLabel(l.risk_level || l.status) }}
                </span>
                <div class="card-badges-extra">
                  <span class="card-badge-verified">Vendedor verificado</span>
                  <span class="card-shipping">Envio gratis</span>
                </div>
                </div>
              <div class="card-body">
                <h3 class="card-title">{{ l.title }}</h3>
                <p class="card-brand">{{ l.brand }} {{ l.model }}</p>
                <div class="card-footer-row">
                  <span class="card-price">{{ formatPrice(l.price) }}</span>
                  <span class="card-chip">{{ l.hardware_type }}</span>
                </div>
              </div>
            </a>
          </article>
        </div>

        <div class="category-cards" *ngIf="!hasFilters && !listings.length && !specializedCategory">
          <a routerLink="/category/cpu" class="cat-card">
            <span class="cat-icon">🖥️</span>
            <span class="cat-name">CPU</span>
            <span class="cat-desc">Procesadores nuevos y usados</span>
          </a>
          <a routerLink="/category/gpu" class="cat-card">
            <span class="cat-icon">🎮</span>
            <span class="cat-name">GPU</span>
            <span class="cat-desc">Tarjetas gráficas gamers</span>
          </a>
          <a routerLink="/category/ram" class="cat-card">
            <span class="cat-icon">💾</span>
            <span class="cat-name">RAM</span>
            <span class="cat-desc">Memorias DDR3/4/5</span>
          </a>
          <a routerLink="/category/ssd" class="cat-card">
            <span class="cat-icon">⚡</span>
            <span class="cat-name">SSD</span>
            <span class="cat-desc">Almacenamiento rápido</span>
          </a>
          <a routerLink="/category/hdd" class="cat-card">
            <span class="cat-icon">📦</span>
            <span class="cat-name">HDD</span>
            <span class="cat-desc">Discos duros grandes</span>
          </a>
          <a routerLink="/category/psu" class="cat-card">
            <span class="cat-icon">🔌</span>
            <span class="cat-name">PSU</span>
            <span class="cat-desc">Fuentes certificadas</span>
          </a>
        </div>

        <div class="empty-state" *ngIf="!specializedCategory && !listings.length && !hasFilters">
          <p>No hay publicaciones aun. Se el primero en publicar!</p>
        </div>
      </ng-container>

      <ng-template #specialized>
        <h2 class="category-title">{{ categoryTitle }}</h2>
        <div class="layout-specialized">
          <aside class="sidebar">
            <div class="sidebar-title">Filtros especializados</div>

            <!-- CPU -->
            <ng-container *ngIf="specializedCategory === 'cpu'">
              <div class="filter-group">
                <label class="filter-label">Socket</label>
                <select [(ngModel)]="cpuSocket" (change)="refresh()">
                  <option value="">Cualquiera</option>
                  <option *ngFor="let s of cpuSockets" [value]="s">{{ s }}</option>
                </select>
              </div>
            </ng-container>

            <!-- RAM -->
            <ng-container *ngIf="specializedCategory === 'ram'">
              <div class="filter-group">
                <label class="filter-label">Tipo</label>
                <select [(ngModel)]="ramType" (change)="refresh()">
                  <option value="">Cualquiera</option>
                  <option value="DIMM">DIMM</option>
                  <option value="So-DIMM">So-DIMM</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-label">DDR</label>
                <select [(ngModel)]="ramDdr" (change)="refresh()">
                  <option value="">Cualquiera</option>
                  <option value="DDR3">DDR3</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-label">Capacidad</label>
                <select [(ngModel)]="ramCapacity" (change)="refresh()">
                  <option value="">Cualquiera</option>
                  <option value="2">2 GB</option>
                  <option value="4">4 GB</option>
                  <option value="8">8 GB</option>
                  <option value="16">16 GB</option>
                  <option value="32">32 GB</option>
                  <option value="64">64 GB</option>
                </select>
              </div>
            </ng-container>

            <!-- GPU -->
            <ng-container *ngIf="specializedCategory === 'gpu'">
              <div class="filter-group">
                <label class="filter-label">Marca</label>
                <select [(ngModel)]="gpuBrand" (change)="refresh()">
                  <option value="">Cualquiera</option>
                  <option value="NVIDIA">NVIDIA</option>
                  <option value="AMD">AMD</option>
                  <option value="Intel">Intel</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-label">VRAM</label>
                <select [(ngModel)]="gpuVram" (change)="refresh()">
                  <option value="">Cualquiera</option>
                  <option value="2">2 GB</option>
                  <option value="4">4 GB</option>
                  <option value="6">6 GB</option>
                  <option value="8">8 GB</option>
                  <option value="12">12 GB</option>
                  <option value="16">16 GB</option>
                </select>
              </div>
            </ng-container>

            <div class="filter-group">
              <label class="filter-label">Marca</label>
              <select [(ngModel)]="brand" (change)="refresh()">
                <option value="">Cualquier marca</option>
                <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Modelo</label>
              <input [(ngModel)]="model" (change)="refresh()" placeholder="Ej: RTX 3070" />
            </div>
            <div class="filter-group">
              <label class="filter-label">Precio minimo</label>
              <input type="number" [(ngModel)]="minPrice" (change)="refresh()" placeholder="$0" />
            </div>
            <div class="filter-group">
              <label class="filter-label">Precio maximo</label>
              <input type="number" [(ngModel)]="maxPrice" (change)="refresh()" placeholder="$999.999" />
            </div>
            <button class="filter-btn" (click)="refresh()">Filtrar</button>
          </aside>

          <div class="results-main">
            <div class="grid">
              <article class="listing-card" *ngFor="let l of listings">
                <a [routerLink]="['/listings', l.id]">
                  <div class="card-image">
                    <img *ngIf="l.images?.length; else placeholderImg4" [src]="resolveSrc(l)" [alt]="l.title" />
                    <ng-template #placeholderImg4>
                      <div class="placeholder-image">Sin imagen</div>
                    </ng-template>
                    <span class="card-badge" [class.pending]="l.status === 'PENDING'" [class.active]="l.status === 'ACTIVE' || l.status === 'APPROVED_BY_ML'">
                      {{ statusLabel(l.status) }}
                    </span>
                    <div class="card-badges-extra">
                      <span class="card-badge-verified">Vendedor verificado</span>
                      <span class="card-shipping">Envio gratis</span>
                    </div>
                    </div>
                  <div class="card-body">
                    <h3 class="card-title">{{ l.title }}</h3>
                    <p class="card-brand">{{ l.brand }} {{ l.model }}</p>
                    <div class="card-footer-row">
                      <span class="card-price">{{ formatPrice(l.price) }}</span>
                      <span class="card-chip">{{ l.hardware_type }}</span>
                    </div>
                  </div>
                </a>
              </article>
            </div>

            <div class="empty-state" *ngIf="!listings.length">
              <p>No se encontraron resultados con los filtros seleccionados.</p>
            </div>
          </div>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 20px;
      position: relative;
    }
    .category-title {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.3px;
      padding: 10px 24px;
      border-radius: 999px;
      background: #0f172a;
      display: inline-block;
      line-height: 1.1;
    }
    .layout {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
    .layout + .grid {
      margin-top: 22px;
    }
    .layout-specialized {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 26px;
      align-items: start;
    }

    /* filtros horizontales generales */
    .filters-bar-horizontal {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-end;
      background: #0f172a;
      padding: 18px;
      border-radius: 14px;
      border: 1px solid #1e293b;
      margin-bottom: 8px;
    }

    /* sidebar filtros especializados */
    .sidebar {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: sticky;
      top: 90px;
    }
    .sidebar-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .results-main {
      min-height: 200px;
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
    .filters-bar-horizontal select,
    .filters-bar-horizontal input,
    .sidebar select,
    .sidebar input {
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #e2e8f0;
      font-size: 14px;
      min-width: 140px;
      width: 100%;
      box-sizing: border-box;
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
      transition: background .15s;
      margin-top: auto;
    }
    .filter-btn:hover {
      background: #1d4ed8;
    }

    .results-info {
      margin: 14px 0 8px;
    }
    .results-count {
      font-size: 13px;
      color: #64748b;
    }

    /* Grid de productos */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 18px;
      margin-top: 16px;
    }
    .grid.wide {
      margin-top: 16px;
    }

    /* Secciones tipo scroll */
    .section {
      margin: 10px 0;
      background: #0b101c;
      border: 1px solid #232d3f;
      border-radius: 16px;
      padding: 14px 12px 12px;
    }
    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .section-title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.3px;
      padding-bottom: 8px;
      border-bottom: 2px solid #334155;
    }
    .section-link {
      font-size: 12px;
      color: #60a5fa;
      text-decoration: none;
      font-weight: 600;
    }
    .section-link:hover {
      text-decoration: underline;
    }
    .section-scroll {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 260px;
      gap: 14px;
      overflow-x: auto;
      padding-bottom: 10px;
    }
    .listing-card.compact {
      min-width: 260px;
    }

    /* Cards */
    .listing-card {
      border: 1px solid #1e293b;
      border-radius: 14px;
      overflow: hidden;
      background: #0f172a;
      transition: transform .15s, box-shadow .15s;
      position: relative;
    }
    .listing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0,0,0,.3);
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
      background: #111827;
      overflow: hidden;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .2s;
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

    /* Badges */
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
    .card-badge.risk-low {
      background: #14532d;
      color: #86efac;
    }
    .card-badge.risk-medium {
      background: #854d0e;
      color: #fef08a;
    }
    .card-badge.risk-high {
      background: #7f1d1d;
      color: #fecaca;
    }
    .card-badge.pending {
      background: #854d0e;
      color: #fef08a;
    }
    .card-badge.active {
      background: #14532d;
      color: #86efac;
    }
    .card-badge-offer {
      position: absolute;
      left: 10px;
      top: 10px;
      background: #dc2626;
      color: #fff;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .3px;
    }
    .card-badge-verified {
      position: absolute;
      left: 10px;
      bottom: 10px;
      background: #0f172a;
      color: #86efac;
      border: 1px solid #14532d;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .card-shipping {
      position: absolute;
      right: 10px;
      bottom: 10px;
      background: #0f172a;
      color: #fef08a;
      border: 1px solid #854d0e;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
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
    .card-badges-extra {
      position: absolute;
      left: 10px;
      bottom: 10px;
      display: flex;
      gap: 6px;
    }

    /* Categorías */
    .category-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 14px;
      margin: 18px 0;
    }
    .cat-card {
      background: #0f172a;
      border: 1px solid #1f2933;
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-decoration: none;
      color: inherit;
      transition: transform .15s, border-color .15s, background .15s;
      position: relative;
      overflow: hidden;
    }
    .cat-card:hover {
      transform: translateY(-2px);
      border-color: #2563eb;
      background: #111827;
    }
    .cat-icon {
      font-size: 22px;
    }
    .cat-name {
      font-size: 16px;
      font-weight: 700;
      color: #e5e7eb;
    }
    .cat-desc {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.3;
    }
    .home-hero {
      background: linear-gradient(180deg, #0f172a 0%, #0b0f19 100%);
      border: 1px solid #1f2933;
      border-radius: 14px;
      padding: 28px 24px;
      margin: 0 0 22px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero-inner {
      max-width: 720px;
      margin: 0 auto;
    }
    .hero-title {
      margin: 0 0 8px;
      font-size: 26px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.4px;
    }
    .hero-subtitle {
      margin: 0;
      color: #9aa3b2;
      font-size: 14px;
    }
    .empty-state {
      text-align: center;
      padding: 48px 20px;
      color: #64748b;
      font-size: 15px;
    }

    @media screen and (max-width: 860px) {
      .layout-specialized {
        grid-template-columns: 1fr;
      }
      .sidebar {
        position: static;
      }
      .section-scroll {
        grid-auto-columns: 220px;
      }
    }
  `]
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  categories: any[] = [];
  brands: string[] = [];

  // filtros generales
  category: string = '';
  brand: string = '';
  model: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  search: string = '';

  // categoría especial desde ruta /category/:slug
  specializedCategory: string = '';

  // filtros especializados
  cpuSocket: string = '';
  ramType: string = '';
  ramDdr: string = '';
  ramCapacity: string = '';
  gpuBrand: string = '';
  gpuVram: string = '';

  cpuSockets: string[] = [
    'LGA1700', 'LGA1200', 'AM5', 'AM4', 'LGA1151', 'LGA2011', 'TR4', 'sTR5', 'sWRX8'
  ];

  mostWanted: Listing[] = [];
  deals: Listing[] = [];

  private base = 'http://127.0.0.1:8000/api/listings';

  constructor(private http: HttpClient, private route: ActivatedRoute, private searchService: SearchService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.base}/categories/`).subscribe({
      next: (data: any) => (this.categories = data || []),
      error: (err: any) => console.error(err)
    });
    this.http.get(`${this.base}/browse/`).subscribe({
      next: (data: any) => {
        const list: Listing[] = (data || []) as Listing[];
        const map = new Map<number, Listing>();
        list.forEach((item) => map.set(item.id, item));
        this.listings = Array.from(map.values());

        this.mostWanted = [...this.listings]
          .sort((a, b) => (b.seller_reputation || 0) - (a.seller_reputation || 0))
          .slice(0, 8);

        const used = new Set(this.mostWanted.map((x) => x.id));
        this.deals = [...this.listings]
          .filter((x) => !used.has(x.id))
          .sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)))
          .slice(0, 8);
      },
      error: (err: any) => console.error(err)
    });

    this.http.get<string[]>(`${this.base}/brands/`).subscribe({
      next: (data: any) => (this.brands = data || []),
      error: (err: any) => console.error(err)
    });

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.specializedCategory = slug;
        const map: Record<string, string> = {
          cpu: 'cpu',
          gpu: 'gpu',
          ram: 'ram',
          ssd: 'ssd',
          hdd: 'hdd',
          psu: 'psu'
        };
        const hw = map[slug];
        if (hw) {
          this.category = '';
          this.brand = '';
          this.model = '';
          this.minPrice = null;
          this.maxPrice = null;
          this.search = '';
          this.cpuSocket = '';
          this.ramType = '';
          this.ramDdr = '';
          this.ramCapacity = '';
          this.gpuBrand = '';
          this.gpuVram = '';
          this.refresh(hw);
          return;
        }
      }
      this.specializedCategory = '';
      this.refresh();
    });

    this.searchService.query.subscribe(value => {
      this.search = value;
      this.refresh();
    });
  }

  get hasFilters(): boolean {
    return !!(
      this.category ||
      this.specializedCategory ||
      this.brand ||
      this.model ||
      this.minPrice != null ||
      this.maxPrice != null ||
      this.search ||
      this.cpuSocket ||
      this.ramType ||
      this.ramDdr ||
      this.ramCapacity ||
      this.gpuBrand ||
      this.gpuVram
    );
  }

  get categoryTitle(): string {
    switch (this.specializedCategory) {
      case 'cpu':
        return 'Procesadores CPU';
      case 'gpu':
        return 'Tarjetas Video GPU';
      case 'ram':
        return 'Memoria RAM';
      case 'ssd':
        return 'SSD';
      case 'hdd':
        return 'HDD';
      case 'psu':
        return 'Fuente Poder PSU';
      default:
        return '';
    }
  }

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

  riskLabel(risk: string): string {
    const key = (risk || '').toUpperCase();
    if (key === 'BAJO') return 'Riesgo Bajo';
    if (key === 'MEDIO') return 'Riesgo Medio';
    if (key === 'ALTO') return 'Riesgo Alto';
    return risk || 'N/D';
  }

  riskLevel(item: Listing): string {
    const raw = (item.risk_level || item.status || '').toString();
    const key = raw.toUpperCase();
    if (key === 'BAJO') return 'Bajo';
    if (key === 'MEDIO') return 'Medio';
    if (key === 'ALTO') return 'Alto';
    if (key === 'APPROVED_BY_ML') return 'Bajo';
    if (key === 'PENDING') return 'Medio';
    return 'Medio';
  }

  resolveSrc(listing: Listing): string {
    if (listing?.images?.length) {
      const raw = listing.images[0] || '';
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return raw;
      }
      const name = raw.split('/').pop() || '';
      if (name) {
        return `http://127.0.0.1:8000/api/listings/assets/listings/${encodeURIComponent(name)}`;
      }
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

  refresh(forceHardwareType?: string) {
    const params: string[] = [];
    if (this.category) {
      params.push(`category=${this.category}`);
    }
    if (this.specializedCategory || forceHardwareType) {
      const hw = forceHardwareType || this.specializedCategory;
      params.push(`hardware_type=${hw}`);
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
    if (this.cpuSocket) {
      params.push(`socket=${encodeURIComponent(this.cpuSocket)}`);
    }
    if (this.ramType) {
      params.push(`ram_type=${encodeURIComponent(this.ramType)}`);
    }
    if (this.ramDdr) {
      params.push(`ram_ddr=${encodeURIComponent(this.ramDdr)}`);
    }
    if (this.ramCapacity) {
      params.push(`ram_capacity=${encodeURIComponent(this.ramCapacity)}`);
    }
    if (this.gpuBrand) {
      params.push(`gpu_brand=${encodeURIComponent(this.gpuBrand)}`);
    }
    if (this.gpuVram) {
      params.push(`gpu_vram=${encodeURIComponent(this.gpuVram)}`);
    }

    const qs = params.length ? '?' + params.join('&') : '';
    this.http.get<any[]>(`${this.base}/browse/${qs}`).subscribe({
      next: (data: any) => {
        const list: Listing[] = (data || []) as Listing[];
        const map = new Map<number, Listing>();
        list.forEach((item) => map.set(item.id, item));
        this.listings = Array.from(map.values());
      },
      error: (err: any) => {
        console.error(err);
        const status = err?.status;
        if (status === 401 || status === 403) {
          this.auth.clearSession?.();
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
