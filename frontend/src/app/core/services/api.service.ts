import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.base}/users/register/`, payload);
  }
}
