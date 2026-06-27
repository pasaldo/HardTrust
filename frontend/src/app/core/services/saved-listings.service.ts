import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SavedListingItem {
  id: number;
  user: number;
  listing: Record<string, any>;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class SavedListingsService {
  private base = 'http://127.0.0.1:8000/api/listings';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('hardtrust_auth');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const access = parsed?.access;
        if (access) {
          headers = headers.set('Authorization', `Bearer ${access}`);
        }
      } catch {
        // leave unauthenticated
      }
    }
    return headers;
  }

  list(): Observable<any> {
    return this.http.get(`${this.base}/saved/`, { headers: this.authHeaders() });
  }

  toggle(listingId: number): Observable<any> {
    return this.http.post(`${this.base}/saved/toggle/${listingId}/`, {}, { headers: this.authHeaders() });
  }
}
