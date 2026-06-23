import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ml-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ml-panel.component.html'
})
export class MlPanelComponent implements OnInit {
  title = '';
  price = 0;
  reputation = 0;
  images = 0;
  result: any;
  private base = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}
  ngOnInit() {}
  predict(e: Event) {
    e.preventDefault();
    this.http
      .post(`${this.base}/ml/predict/`, {
        title: this.title,
        description: '',
        price: this.price,
        seller_reputation: this.reputation,
        images_count: this.images
      })
      .subscribe({
        next: (r) => (this.result = r),
        error: (err) => console.error(err)
      });
  }
}
