import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClient],
  template: `
    <nav class="topbar">
      <a routerLink="/listings" class="brand">HardTrust</a>
      <a routerLink="/listings" routerLinkActive="active">Inicio</a>
      <a routerLink="/profile" routerLinkActive="active">Mi perfil</a>
    </nav>

    <section class="container" *ngIf="listing; else loading">
      <header class="header">
        <h1>{{ listing.title }}</h1>
        <p class="price">${{ listing.price }}</p>
        <p class="status">{{ listing.status }} · Riesgo: {{ listing.risk_level }}</p>
      </header>

      <div class="layout">
        <div class="media">
          <img *ngIf="listing.images?.length; else noImage" [src]="listing.images[0]" [alt]="listing.title" />
          <ng-template #noImage>
            <div class="no-image">Sin imagen</div>
          </ng-template>
          <div class="thumbs" *ngIf="listing.images?.length > 1">
            <img *ngFor="let img of listing.images" [src]="img" [alt]="listing.title" />
          </div>
        </div>

        <div class="info">
          <h2>Descripción</h2>
          <p class="description">{{ listing.description }}</p>

          <div class="meta">
            <p><strong>Categoría:</strong> {{ listing.category }}</p>
            <p><strong>Tipo:</strong> {{ listing.hardware_type }}</p>
            <p><strong>Marca:</strong> {{ listing.brand }}</p>
            <p><strong>Modelo:</strong> {{ listing.model }}</p>
          </div>

          <div class="seller">
            <h3>Vendedor</h3>
            <p>{{ listing.seller_name }}</p>
            <p>Reputación: {{ listing.seller_reputation }}</p>
          </div>
        </div>
      </div>
    </section>

    <ng-template #loading>
      <p class="empty">Cargando publicación...</p>
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

    .container { max-width: 1100px; margin: 0 auto; padding: 16px; }
    .header { margin-bottom: 16px; }
    .price { font-size: 22px; font-weight: 700; color: #0f172a; }
    .status { color: #64748b; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .media img { width: 100%; border-radius: 12px; border: 1px solid #e5e7eb; }
    .thumbs { display: flex; gap: 8px; margin-top: 8px; }
    .thumbs img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
    .no-image { height: 260px; background: #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #64748b; }

    .info h2 { margin-top: 0; }
    .description { white-space: pre-wrap; color: #1e293b; }
    .meta p { margin: 4px 0; color: #334155; }
    .seller { margin-top: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc; }
    .empty { text-align: center; padding: 40px; color: #6b7280; }

    @media (max-width: 768px) {
      .layout { grid-template-columns: 1fr; }
    }
  `]
})
export class ListingDetailComponent implements OnInit {
  listing: any;
  private base = 'http://127.0.0.1:8000/api/listings';
  constructor(private http: HttpClient, private route: import('@angular/router').ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.http.get<any>(`${this.base}/listings/${id}/`).subscribe({
      next: (data) => (this.listing = data),
      error: (err) => console.error(err)
    });
  }
}
