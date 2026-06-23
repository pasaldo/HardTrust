import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Conversation {
  id: number;
  created_at: string;
}

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Conversaciones</h2>
    <button (click)="refresh()">Recargar</button>
    <ul *ngIf="items.length; else empty">
      <li *ngFor="let c of items">Conversación #{{ c.id }} — {{ c.created_at }}</li>
    </ul>
    <ng-template #empty><p>No conversations.</p></ng-template>
  `
})
export class ConversationListComponent implements OnInit {
  items: Conversation[] = [];
  private base = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}
  ngOnInit() { this.refresh(); }
  refresh() {
    this.http.get<any[]>(`${this.base}/messaging/conversations/`).subscribe({
      next: (data) => (this.items = data || []),
      error: (err) => console.error(err)
    });
  }
}
