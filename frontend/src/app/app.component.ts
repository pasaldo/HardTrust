import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { SearchService } from './core/services/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <header class="site-header">
      <div class="top-bar">
        <div class="top-bar-inner">
          <span class="top-brand">HardTrust · Marketplace de Hardware</span>
          <nav class="top-links">
            <a href="javascript:void(0)" class="top-link">Ayuda</a>
            <a href="javascript:void(0)" class="top-link">Discord</a>
          </nav>
        </div>
      </div>

      <div class="main-header">
        <div class="main-header-inner">
          <a routerLink="/listings" class="logo">HardTrust</a>

          <div class="search-box">
            <input
              class="search-input"
              placeholder="Buscar componentes, marcas, modelos..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="doSearch()"
            />
            <button class="search-btn" (click)="doSearch()">Buscar</button>
          </div>

          <div class="header-actions">
            <a routerLink="/listings" routerLinkActive="active" class="action-link">Explorar</a>
            <a href="javascript:void(0)" class="action-link accent">Publicar</a>
            <a *ngIf="!loggedIn" routerLink="/login" routerLinkActive="active" class="action-link">Ingresar</a>
            <a *ngIf="loggedIn" routerLink="/profile" routerLinkActive="active" class="action-link profile-btn">Mi perfil</a>
            <a *ngIf="loggedIn" (click)="logout()" class="action-link logout-btn">Cerrar sesión</a>
          </div>
        </div>
      </div>

      <nav class="cats-nav" [class.hide-on-auth]="isAuthPage">
        <a routerLink="/category/cpu" routerLinkActive="active">CPU</a>
        <a routerLink="/category/gpu" routerLinkActive="active">GPU</a>
        <a routerLink="/category/ram" routerLinkActive="active">RAM</a>
        <a routerLink="/category/ssd" routerLinkActive="active">SSD</a>
        <a routerLink="/category/hdd" routerLinkActive="active">HDD</a>
        <a routerLink="/category/psu" routerLinkActive="active">PSU</a>
        <a routerLink="/listings" routerLinkActive="active">Todos</a>
      </nav>
    </header>

    <main class="main">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">HardTrust</span>
          <span class="footer-tagline">Marketplace de Hardware de PC</span>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>📧 contacto&#64;hardtrust.cl</p>
          <p>📞 +56 2 2345 6789</p>
          <p>💬 Discord: hardtrust.cl</p>
        </div>
        <div class="footer-section">
          <h4>Ubicación</h4>
          <p>Av. Providencia 1208, Santiago<br>Región Metropolitana, Chile</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ currentYear }} HardTrust. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .site-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #0b0f19;
      border-bottom: 1px solid #1f2933;
    }

    .top-bar {
      background: #07090f;
      border-bottom: 1px solid #111827;
    }
    .top-bar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .top-brand {
      font-size: 12px;
      color: #9aa3b2;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .top-links {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .top-link {
      color: #9aa3b2;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
    }
    .top-link:hover {
      color: #e5e7eb;
    }

    .main-header {
      background: #0b0f19;
      border-bottom: 1px solid #1f2933;
    }
    .main-header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      text-decoration: none;
      letter-spacing: -0.6px;
      white-space: nowrap;
    }
    .search-box {
      flex: 1;
      max-width: 640px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .search-input {
      flex: 1;
      background: #111827;
      border: 1px solid #343f50;
      color: #e5e7eb;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
    }
    .search-input::placeholder {
      color: #6b7280;
    }
    .search-input:focus {
      border-color: #3b82f6;
    }
    .search-btn {
      padding: 10px 18px;
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
    .search-btn:hover {
      background: #1d4ed8;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .action-link {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      padding: 8px 10px;
      border-radius: 8px;
      transition: background .15s, color .15s;
    }
    .action-link:hover {
      background: #111827;
      color: #fff;
    }
    .action-link.accent {
      background: #2563eb;
      color: #fff;
      padding: 8px 14px;
    }
    .action-link.accent:hover {
      background: #1d4ed8;
    }
    .profile-btn {
      background: #111827;
      border: 1px solid #343f50;
    }
    .profile-btn:hover {
      background: #1a2230;
      border-color: #4b5563;
    }
    .logout-btn {
      background: transparent;
      border: 1px solid #ef4444;
      color: #fca5a5;
    }
    .logout-btn:hover {
      background: #7f1d1d;
      color: #fff;
      border-color: #f87171;
    }

    .cats-nav {
      background: #0b0f19;
      border-bottom: 1px solid #1f2933;
      overflow-x: auto;
    }
    .cats-nav a {
      color: #9aa3b2;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 16px;
      display: inline-block;
      border-bottom: 2px solid transparent;
      transition: color .15s, border-color .15s;
      white-space: nowrap;
    }
    .cats-nav a:hover {
      color: #e5e7eb;
    }
    .cats-nav a.active {
      color: #fff;
      border-bottom-color: #2563eb;
    }
    .cats-nav.hide-on-auth {
      display: none;
    }

    .main {
      min-height: 100vh;
    }

    .site-footer {
      background: #0b0f19;
      border-top: 1px solid #1f2933;
      color: #9aa3b2;
      font-size: 13px;
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 28px 24px;
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 24px;
    }
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .footer-logo {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .footer-tagline {
      color: #7b8794;
      font-size: 13px;
    }
    .footer-section h4 {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 700;
      color: #e5e7eb;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .footer-section p {
      margin: 0 0 4px;
      line-height: 1.5;
    }
    .footer-bottom {
      border-top: 1px solid #111827;
    }
    .footer-bottom p {
      max-width: 1280px;
      margin: 0 auto;
      padding: 14px 24px;
      color: #7b8794;
      font-size: 12px;
    }

    @media (max-width: 900px) {
      .footer-inner {
        grid-template-columns: 1fr;
      }
      .main-header-inner {
        flex-wrap: wrap;
        gap: 14px;
      }
      .search-box {
        order: 3;
        max-width: 100%;
        flex-basis: 100%;
      }
      .header-actions {
        margin-left: auto;
      }
    }
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  searchQuery = '';

  constructor() {}

  @HostListener('document:click')
  onDocumentClick() {}

  get loggedIn(): boolean {
    return !!this.auth.loadSession();
  }

  get isAuthPage(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/login' || url === '/register';
  }

  doSearch() {
    this.searchService.setQuery(this.searchQuery);
  }

  logout() {
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
