import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);
  user: any = null;

  ngOnInit() {
    this.http.get('https://api.github.com/users/franetovichpia').subscribe(data => {
      this.user = data;
      this.cdr.detectChanges();
    });
  }
}