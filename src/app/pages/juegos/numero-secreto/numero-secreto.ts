import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-numero-secreto',
  standalone: true,
  imports: [],
  templateUrl: './numero-secreto.html',
  styleUrl: './numero-secreto.css'
})
export class NumeroSecreto implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly MIN = 1;
  readonly MAX = 100;
  readonly MAX_INTENTOS = 10;

  numeroSecreto = 0;
  intentoActual = '';
  intentos = 0;
  pista = '';
  historial: { numero: number; pista: string }[] = [];
  tiempoSegundos = 0;
  usuarioEmail = '';

  juegoIniciado = false;
  juegoTerminado = false;
  ganoPartida = false;
  mostrarRanking = false;
  mostrarConfirmAbandonar = false;
  ranking: any[] = [];

  private intervalo: any;

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    this.usuarioEmail = data.session?.user?.email ?? '';
  }

  iniciarJuego() {
    this.numeroSecreto = Math.floor(Math.random() * (this.MAX - this.MIN + 1)) + this.MIN;
    this.intentoActual = '';
    this.intentos = 0;
    this.pista = '';
    this.historial = [];
    this.tiempoSegundos = 0;
    this.juegoIniciado = true;
    this.juegoTerminado = false;
    this.ganoPartida = false;
    this.mostrarRanking = false;
    this.mostrarConfirmAbandonar = false;

    clearInterval(this.intervalo);
    this.intervalo = setInterval(() => {
      this.tiempoSegundos++;
      this.cdr.detectChanges();
    }, 1000);
  }

  seleccionarNumero(n: number) {
    if (this.juegoTerminado) return;
    this.intentoActual = n.toString();
    this.cdr.detectChanges();
  }

  adivinar() {
    const numero = parseInt(this.intentoActual);
    if (isNaN(numero) || numero < this.MIN || numero > this.MAX) return;
    if (this.juegoTerminado) return;

    this.intentos++;

    if (numero === this.numeroSecreto) {
      this.pista = '🎉 ¡Adivinaste!';
      this.historial.unshift({ numero, pista: '✅ ¡Correcto!' });
      this.finalizarPartida(true);
    } else if (this.intentos >= this.MAX_INTENTOS) {
      this.pista = `💀 Sin intentos. Era el ${this.numeroSecreto}`;
      this.historial.unshift({ numero, pista: numero < this.numeroSecreto ? '📈 Muy bajo' : '📉 Muy alto' });
      this.finalizarPartida(false);
    } else if (numero < this.numeroSecreto) {
      this.pista = '📈 El número secreto es mayor';
      this.historial.unshift({ numero, pista: '📈 Muy bajo' });
    } else {
      this.pista = '📉 El número secreto es menor';
      this.historial.unshift({ numero, pista: '📉 Muy alto' });
    }

    this.intentoActual = '';
    this.cdr.detectChanges();
  }

  async finalizarPartida(gano: boolean) {
    this.ganoPartida = gano;
    this.juegoTerminado = true;
    clearInterval(this.intervalo);

    await this.supabase.guardarResultadoNumeroSecreto({
      usuario_email: this.usuarioEmail,
      numero_secreto: this.numeroSecreto,
      intentos: this.intentos,
      tiempo_segundos: this.tiempoSegundos,
      gano
    });

    const { data } = await this.supabase.getRankingNumeroSecreto();
    this.ranking = data ?? [];
    this.cdr.detectChanges();
  }

  confirmarAbandonar() { this.mostrarConfirmAbandonar = true; }
  cancelarAbandonar() { this.mostrarConfirmAbandonar = false; }

  abandonarPartida() {
    clearInterval(this.intervalo);
    this.router.navigate(['/home']);
  }

  irAlHome() { this.router.navigate(['/home']); }

  formatearTiempo(): string {
    const m = Math.floor(this.tiempoSegundos / 60).toString().padStart(2, '0');
    const s = (this.tiempoSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get intentosRestantes(): number {
    return this.MAX_INTENTOS - this.intentos;
  }

  get numeros(): number[] {
    return Array.from({ length: this.MAX }, (_, i) => i + 1);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}