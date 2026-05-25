import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css'
})
export class MayorMenor implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly RONDAS_TOTALES = 15;

  palos = [
    { nombre: 'oros', emoji: '🌕' },
    { nombre: 'copas', emoji: '🏆' },
    { nombre: 'espadas', emoji: '⚔️' },
    { nombre: 'bastos', emoji: '🪵' }
  ];

  valores = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  nombresValores: { [k: number]: string } = {
    1: 'As', 2: '2', 3: '3', 4: '4', 5: '5',
    6: '6', 7: '7', 10: 'Sota', 11: 'Caballo', 12: 'Rey'
  };

  mazo: { valor: number; palo: { nombre: string; emoji: string } }[] = [];
  cartaActual: { valor: number; palo: { nombre: string; emoji: string } } | null = null;
  cartaSiguiente: { valor: number; palo: { nombre: string; emoji: string } } | null = null;

  rondaActual = 0;
  rondasGanadas = 0;
  puntajeTotal = 0;
  tiempoSegundos = 0;
  usuarioEmail = '';

  juegoIniciado = false;
  juegoTerminado = false;
  esperandoRespuesta = false;
  resultadoRonda: 'gano' | 'perdio' | 'empate' | null = null;
  ganoPartida = false;
  mostrarRanking = false;
  mostrarConfirmAbandonar = false;
  ranking: any[] = [];

  private intervalo: any;
  private timeoutRonda: any;

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    this.usuarioEmail = data.session?.user?.email ?? '';
    this.prepararPartida();
  }

  prepararPartida() {
    this.mazo = [];
    for (const palo of this.palos) {
      for (const valor of this.valores) {
        this.mazo.push({ valor, palo });
      }
    }
    this.mazo.sort(() => Math.random() - 0.5);

    this.rondaActual = 0;
    this.rondasGanadas = 0;
    this.puntajeTotal = 0;
    this.tiempoSegundos = 0;
    this.juegoIniciado = false;
    this.juegoTerminado = false;
    this.esperandoRespuesta = false;
    this.resultadoRonda = null;
    this.cartaActual = null;
    this.cartaSiguiente = null;
    this.mostrarRanking = false;
    this.mostrarConfirmAbandonar = false;
    clearInterval(this.intervalo);
    clearTimeout(this.timeoutRonda);
  }

  iniciarJuego() {
    this.juegoIniciado = true;
    this.cartaActual = this.mazo[0];
    this.intervalo = setInterval(() => {
      this.tiempoSegundos++;
      this.cdr.detectChanges();
    }, 1000);
  }

  adivinar(eleccion: 'mayor' | 'menor') {
    if (this.esperandoRespuesta || this.juegoTerminado) return;

    const siguiente = this.mazo[this.rondaActual + 1];
    this.cartaSiguiente = siguiente;
    this.esperandoRespuesta = true;

    const empate = siguiente.valor === this.cartaActual!.valor;
    const gano = !empate && (
      (eleccion === 'mayor' && siguiente.valor > this.cartaActual!.valor) ||
      (eleccion === 'menor' && siguiente.valor < this.cartaActual!.valor)
    );
    const perdio = !empate && !gano;

    if (empate) {
      this.resultadoRonda = 'empate';
    } else if (gano) {
      this.resultadoRonda = 'gano';
      this.rondasGanadas++;
      this.puntajeTotal += 100;
    } else {
      this.resultadoRonda = 'perdio';
    }

    this.cdr.detectChanges();

    this.timeoutRonda = setTimeout(() => {
      this.cartaActual = siguiente;
      this.cartaSiguiente = null;
      this.resultadoRonda = null;
      this.esperandoRespuesta = false;
      this.rondaActual++;
      this.cdr.detectChanges();

      if (perdio) {
        this.finalizarPartida(false);
      } else if (this.rondaActual >= this.RONDAS_TOTALES) {
        this.finalizarPartida(true);
      }
    }, 1400);
  }

  async finalizarPartida(gano: boolean) {
    this.ganoPartida = gano;
    this.juegoTerminado = true;
    clearInterval(this.intervalo);
    this.cdr.detectChanges();

    await this.supabase.guardarResultadoMayorMenor({
      usuario_email: this.usuarioEmail,
      rondas_totales: this.RONDAS_TOTALES,
      rondas_ganadas: this.rondasGanadas,
      puntaje: this.puntajeTotal,
      tiempo_segundos: this.tiempoSegundos
    });

    await this.cargarRanking();
    this.cdr.detectChanges();
  }

  async cargarRanking() {
    const { data } = await this.supabase.getRankingMayorMenor();
    this.ranking = data ?? [];
  }

  confirmarAbandonar() { this.mostrarConfirmAbandonar = true; }
  cancelarAbandonar() { this.mostrarConfirmAbandonar = false; }

  abandonarPartida() {
    clearInterval(this.intervalo);
    clearTimeout(this.timeoutRonda);
    this.router.navigate(['/home']);
  }

  irAlHome() { this.router.navigate(['/home']); }

  getNombreValor(valor: number): string {
    return this.nombresValores[valor] ?? valor.toString();
  }

  formatearTiempo(): string {
    const m = Math.floor(this.tiempoSegundos / 60).toString().padStart(2, '0');
    const s = (this.tiempoSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get progresoLabel(): string {
    return `Ronda ${this.rondaActual} / ${this.RONDAS_TOTALES}`;
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
    clearTimeout(this.timeoutRonda);
  }
}