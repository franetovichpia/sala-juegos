import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css'
})
export class Resultados implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rankingAhorcado: any[] = [];
  rankingMayorMenor: any[] = [];
  rankingPreguntados: any[] = [];
  rankingNumeroSecreto: any[] = [];

  cargando = true;

  async ngOnInit() {
    await this.cargarTodos();
  }

  async cargarTodos() {
    this.cargando = true;
    this.cdr.detectChanges();
    try {
      const [ahorcado, mayorMenor, preguntados, numeroSecreto] = await Promise.all([
        this.supabase.getRankingAhorcado(),
        this.supabase.getRankingMayorMenor(),
        this.supabase.getRankingPreguntados(),
        this.supabase.getRankingNumeroSecreto()
      ]);

      this.rankingAhorcado = ahorcado.data ?? [];
      this.rankingMayorMenor = mayorMenor.data ?? [];
      this.rankingPreguntados = preguntados.data ?? [];
      this.rankingNumeroSecreto = numeroSecreto.data ?? [];
    } catch (e) {
      console.error('Error cargando resultados', e);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  irAlHome() { this.router.navigate(['/home']); }
}