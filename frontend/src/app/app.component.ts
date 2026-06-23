import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  template: `
    <header style="padding:12px;background:#222;color:#fff;">
      <h1>HardTrust</h1>
      <nav>
        <a routerLink="/listings" routerLinkActive="active" style="color:#fff;margin-right:12px;">Listings</a>
        <a routerLink="/chat" routerLinkActive="active" style="color:#fff;margin-right:12px;">Chat</a>
        <a routerLink="/ml" routerLinkActive="active" style="color:#fff;margin-right:12px;">ML</a>
        <ng-container *ngIf="!session; else authActions">
          <a routerLink="/login" routerLinkActive="active" style="color:#fff;margin-right:12px;">Login</a>
          <a routerLink="/register" routerLinkActive="active" style="color:#fff;">Register</a>
        </ng-container>
        <ng-template #authActions>
          <span style="margin-right:12px;">Hola, {{ session?.user?.email }}</span>
          <button (click)="logout()" style="background:#444;color:#fff;border:none;padding:6px 10px;">Salir</button>
        </ng-template>
      </nav>
    </header>
    <main style="padding:16px;">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`:host { display:block; } a.active { font-weight:bold; text-decoration: underline; }`]
})
export class AppComponent implements OnInit {
  session: any = null;
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.session = this.auth.loadSession();
  }

  logout() {
    this.auth.clearSession();
    this.session = null;
  }
}
