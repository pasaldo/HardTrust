import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private query$ = new BehaviorSubject<string>('');
  query = this.query$.asObservable();

  setQuery(value: string) {
    this.query$.next(value);
  }
}
