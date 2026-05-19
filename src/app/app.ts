import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);
  estaLogueado = false;

  ngOnInit() {
    this.supabase.getSession().then(({ data }) => {
      this.estaLogueado = !!data.session;
      this.cdr.detectChanges();
    });

    this.supabase.onAuthChange(session => {
      this.estaLogueado = !!session;
      this.cdr.detectChanges();
    });
  }
}