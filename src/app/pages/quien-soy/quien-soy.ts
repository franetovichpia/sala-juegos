import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy {
  http = inject(HttpClient);
  user: any;

  ngOnInit() {
    this.http.get('https://api.github.com/users//franetovichpia').subscribe(data => this.user = data);
  }
}
