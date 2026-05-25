import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css'
})
export class Ahorcado implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  todasLasPalabras: { palabra: string; pista: string }[] = [
    { palabra: 'ANGULAR', pista: 'Framework de Google para apps web' },
    { palabra: 'TYPESCRIPT', pista: 'JavaScript con tipado estático' },
    { palabra: 'PROGRAMACION', pista: 'Actividad de escribir código' },
    { palabra: 'COMPONENTE', pista: 'Bloque reutilizable de UI en Angular' },
    { palabra: 'SERVICIO', pista: 'Clase que provee lógica compartida en Angular' },
    { palabra: 'JAVASCRIPT', pista: 'Lenguaje de scripting para la web' },
    { palabra: 'DESARROLLO', pista: 'Proceso de crear software' },
    { palabra: 'INTERFAZ', pista: 'Contrato de tipos en TypeScript' },
    { palabra: 'VARIABLE', pista: 'Contenedor de datos en programación' },
    { palabra: 'FUNCION', pista: 'Bloque de código reutilizable' },
    { palabra: 'NAVEGADOR', pista: 'Chrome, Firefox o Edge' },
    { palabra: 'APLICACION', pista: 'Programa que corre en un dispositivo' },
    { palabra: 'FRAMEWORK', pista: 'Estructura base para desarrollar software' },
    { palabra: 'BASE', pista: 'Primer nivel de una estructura de datos' },
    { palabra: 'DATOS', pista: 'Información almacenada en un sistema' },
    { palabra: 'SUPABASE', pista: 'Alternativa open source a Firebase' },
    { palabra: 'AUTENTICACION', pista: 'Proceso de verificar identidad de un usuario' },
    { palabra: 'ENRUTADOR', pista: 'Módulo que maneja la navegación en Angular' },
    { palabra: 'MODULO', pista: 'Agrupación de funcionalidades en un programa' },
    { palabra: 'DIRECTIVA', pista: 'Instrucción que modifica el DOM en Angular' }
  ];

  abecedario = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Cola de palabras mezcladas
  colaPalabras: { palabra: string; pista: string }[] = [];
  indiceActual = 0;

  palabra = '';
  pista = '';
  letrasUsadas: string[] = [];
  maxErrores = 6;
  errores = 0;
  usoPista = false;

  // Estado general
  juegoIniciado = false;
  juegoTerminado = false; // termina la partida completa
  palabraTerminada = false; // termina la palabra actual
  ganoPalabra = false;
  ganoPartida = false;

  // Acumulados
  palabrasGanadas = 0;
  puntajeTotal = 0;

  tiempoSegundos = 0;
  usuarioEmail = '';
  mostrarPista = false;
  mostrarConfirmAbandonar = false;
  ranking: any[] = [];
  mostrarRanking = false;

  private intervalo: any;

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    this.usuarioEmail = data.session?.user?.email ?? '';
    this.prepararPartida();
  }

  prepararPartida() {
    // Mezclar palabras
    this.colaPalabras = [...this.todasLasPalabras].sort(() => Math.random() - 0.5);
    this.indiceActual = 0;
    this.palabrasGanadas = 0;
    this.puntajeTotal = 0;
    this.tiempoSegundos = 0;
    this.juegoIniciado = false;
    this.juegoTerminado = false;
    this.mostrarRanking = false;
    this.mostrarConfirmAbandonar = false;
    this.cargarPalabraActual();
  }

  cargarPalabraActual() {
    const entrada = this.colaPalabras[this.indiceActual];
    this.palabra = entrada.palabra;
    this.pista = entrada.pista;
    this.letrasUsadas = [];
    this.errores = 0;
    this.usoPista = false;
    this.mostrarPista = false;
    this.palabraTerminada = false;
    this.ganoPalabra = false;
  }

  iniciarJuego() {
    this.juegoIniciado = true;
    this.intervalo = setInterval(() => this.tiempoSegundos++, 1000);
  }

  get palabraMostrada(): string[] {
    return this.palabra.split('').map(l => this.letrasUsadas.includes(l) ? l : '_');
  }

  verPista() {
    this.mostrarPista = true;
    this.usoPista = true;
  }

  seleccionarLetra(letra: string) {
    if (this.palabraTerminada || this.letrasUsadas.includes(letra)) return;
    this.letrasUsadas.push(letra);

    if (!this.palabra.includes(letra)) {
      this.errores++;
      if (this.errores >= this.maxErrores) {
        this.resolverPalabra(false);
      }
    } else {
      if (this.palabraMostrada.every(l => l !== '_')) {
        this.resolverPalabra(true);
      }
    }
  }

  resolverPalabra(gano: boolean) {
    this.palabraTerminada = true;
    this.ganoPalabra = gano;

    if (gano) {
      let puntos = 100;
      if (this.usoPista) puntos -= 20;
      puntos -= this.errores * 10;
      if (puntos < 0) puntos = 0;
      this.puntajeTotal += puntos;
      this.palabrasGanadas++;
    }
  }

  siguientePalabra() {
    this.indiceActual++;
    if (this.indiceActual >= this.colaPalabras.length) {
      this.finalizarPartida(true);
    } else {
      this.cargarPalabraActual();
    }
  }

  async finalizarPartida(gano: boolean) {
    this.ganoPartida = gano;
    this.juegoTerminado = true;
    clearInterval(this.intervalo);

    await this.supabase.guardarResultadoAhorcado({
      usuario_email: this.usuarioEmail,
      palabras_totales: this.colaPalabras.length,
      palabras_ganadas: this.palabrasGanadas,
      puntaje: this.puntajeTotal,
      tiempo_segundos: this.tiempoSegundos
    });

    await this.cargarRanking();
  }

  async cargarRanking() {
    const { data } = await this.supabase.getRankingAhorcado();
    this.ranking = data ?? [];
  }

  confirmarAbandonar() {
    this.mostrarConfirmAbandonar = true;
  }

  cancelarAbandonar() {
    this.mostrarConfirmAbandonar = false;
  }

  abandonarPartida() {
    clearInterval(this.intervalo);
    this.router.navigate(['/home']);
  }

  irAlHome() {
    this.router.navigate(['/home']);
  }

  estaUsada(letra: string): boolean {
    return this.letrasUsadas.includes(letra);
  }

  esError(letra: string): boolean {
    return this.letrasUsadas.includes(letra) && !this.palabra.includes(letra);
  }

  formatearTiempo(): string {
    const m = Math.floor(this.tiempoSegundos / 60).toString().padStart(2, '0');
    const s = (this.tiempoSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get progresoLabel(): string {
    return `Palabra ${this.indiceActual + 1} / ${this.colaPalabras.length}`;
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}