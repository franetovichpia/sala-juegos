import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubService } from '../../services/github.service'; // ajustá el path si hace falta

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy {
  private githubService = inject(GithubService); // usas el service
  cdr = inject(ChangeDetectorRef);
  user: any = null;

  ngOnInit() {
    this.githubService.getUser('franetovichpia').subscribe(data => {
      this.user = data;
      this.cdr.detectChanges();
    });
  }
}