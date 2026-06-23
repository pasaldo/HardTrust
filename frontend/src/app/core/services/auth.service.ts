import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    reputation: number;
    created_at: string;
    updated_at: string;
  };
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://127.0.0.1:8000/api';
  private storageKey = 'hardtrust_auth';

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/users/register/`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/users/login/`, payload);
  }

  saveSession(auth: AuthResponse) {
    localStorage.setItem(this.storageKey, JSON.stringify(auth));
  }

  loadSession(): AuthResponse | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem(this.storageKey);
  }

  get accessToken(): string | null {
    const session = this.loadSession();
    return session ? session.access : null;
  }
}
