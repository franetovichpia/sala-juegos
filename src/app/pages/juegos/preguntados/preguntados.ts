import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css'
})
export class Preguntados implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly TOTAL_PREGUNTAS = 10;
  readonly TIEMPO_POR_PREGUNTA = 15;

  preguntas: {
    pregunta: string;
    correcta: string;
    opciones: string[];
  }[] = [];

  indiceActual = 0;
  opcionSeleccionada: string | null = null;
  respondio = false;
  fueCorrecta = false;

  puntajeTotal = 0;
  preguntasCorrectas = 0;
  tiempoSegundos = 0;
  tiempoRestante = this.TIEMPO_POR_PREGUNTA;
  usuarioEmail = '';

  juegoIniciado = false;
  juegoTerminado = false;
  cargando = false;
  mostrarRanking = false;
  mostrarConfirmAbandonar = false;
  ranking: any[] = [];

  private intervaloTiempo: any;
  private intervaloCuenta: any;

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    this.usuarioEmail = data.session?.user?.email ?? '';
  }

  async prepararPartida() {
    this.cargando = true;
    this.indiceActual = 0;
    this.puntajeTotal = 0;
    this.preguntasCorrectas = 0;
    this.tiempoSegundos = 0;
    this.tiempoRestante = this.TIEMPO_POR_PREGUNTA;
    this.opcionSeleccionada = null;
    this.respondio = false;
    this.juegoIniciado = false;
    this.juegoTerminado = false;
    this.mostrarRanking = false;
    this.mostrarConfirmAbandonar = false;
    clearInterval(this.intervaloTiempo);
    clearInterval(this.intervaloCuenta);

    try {
      const res = await fetch(`https://opentdb.com/api.php?amount=${this.TOTAL_PREGUNTAS}&type=multiple`);
      const data = await res.json();

      this.preguntas = data.results.map((q: any) => {
        const opciones = [...q.incorrect_answers, q.correct_answer]
          .sort(() => Math.random() - 0.5)
          .map((o: string) => this.decodificarHTML(o));

        return {
          pregunta: this.decodificarHTML(q.question),
          correcta: this.decodificarHTML(q.correct_answer),
          opciones
        };
      });
    } catch {
      // fallback preguntas locales si falla la API
      this.preguntas = [
        { pregunta: '¿Cuál es el lenguaje de programación más usado en la web?', correcta: 'JavaScript', opciones: ['JavaScript', 'Python', 'Java', 'C++'] },
        { pregunta: '¿Qué significa HTML?', correcta: 'HyperText Markup Language', opciones: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Modern Links', 'Home Tool Markup Language'] },
        { pregunta: '¿Qué empresa desarrolló Angular?', correcta: 'Google', opciones: ['Google', 'Facebook', 'Microsoft', 'Apple'] },
        { pregunta: '¿Qué es TypeScript?', correcta: 'Un superset de JavaScript con tipado', opciones: ['Un superset de JavaScript con tipado', 'Un lenguaje de backend', 'Un framework CSS', 'Una base de datos'] },
        { pregunta: '¿Qué significa CSS?', correcta: 'Cascading Style Sheets', opciones: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Syntax'] },
        { pregunta: '¿Qué es Supabase?', correcta: 'Alternativa open source a Firebase', opciones: ['Alternativa open source a Firebase', 'Un framework de Angular', 'Un lenguaje de consultas', 'Un servidor de emails'] },
        { pregunta: '¿Qué es un componente en Angular?', correcta: 'Una pieza reutilizable de UI', opciones: ['Una pieza reutilizable de UI', 'Un archivo de estilos', 'Una ruta de navegación', 'Una tabla de base de datos'] },
        { pregunta: '¿Qué hace el comando ng serve?', correcta: 'Levanta el servidor de desarrollo', opciones: ['Levanta el servidor de desarrollo', 'Compila el proyecto', 'Crea un componente', 'Instala dependencias'] },
        { pregunta: '¿Qué es un guard en Angular?', correcta: 'Protege el acceso a rutas', opciones: ['Protege el acceso a rutas', 'Maneja errores HTTP', 'Gestiona el estado', 'Aplica estilos globales'] },
        { pregunta: '¿Qué es una API REST?', correcta: 'Una interfaz de comunicación entre sistemas', opciones: ['Una interfaz de comunicación entre sistemas', 'Un tipo de base de datos', 'Un framework de testing', 'Un protocolo de seguridad'] },
      ];
    }

    this.cargando = false;
    this.juegoIniciado = true;
    this.iniciarTemporizadores();
    this.cdr.detectChanges();
  }

  iniciarTemporizadores() {
    this.intervaloTiempo = setInterval(() => {
      this.tiempoSegundos++;
      this.cdr.detectChanges();
    }, 1000);

    this.intervaloCuenta = setInterval(() => {
      this.tiempoRestante--;
      this.cdr.detectChanges();
      if (this.tiempoRestante <= 0 && !this.respondio) {
        this.responder(null);
      }
    }, 1000);
  }

  responder(opcion: string | null) {
    if (this.respondio) return;

    this.respondio = true;
    this.opcionSeleccionada = opcion;
    clearInterval(this.intervaloCuenta);

    const correcta = this.preguntas[this.indiceActual].correcta;
    this.fueCorrecta = opcion === correcta;

    if (this.fueCorrecta) {
      const bonus = Math.floor(this.tiempoRestante * 5);
      this.puntajeTotal += 100 + bonus;
      this.preguntasCorrectas++;
    }

    this.cdr.detectChanges();

    setTimeout(() => {
      this.indiceActual++;
      this.opcionSeleccionada = null;
      this.respondio = false;
      this.tiempoRestante = this.TIEMPO_POR_PREGUNTA;

      if (this.indiceActual >= this.TOTAL_PREGUNTAS) {
        this.finalizarPartida();
      } else {
        this.intervaloCuenta = setInterval(() => {
          this.tiempoRestante--;
          this.cdr.detectChanges();
          if (this.tiempoRestante <= 0 && !this.respondio) {
            this.responder(null);
          }
        }, 1000);
      }

      this.cdr.detectChanges();
    }, 1500);
  }

  async finalizarPartida() {
    this.juegoTerminado = true;
    clearInterval(this.intervaloTiempo);
    clearInterval(this.intervaloCuenta);

    await this.supabase.guardarResultadoPreguntados({
      usuario_email: this.usuarioEmail,
      preguntas_totales: this.TOTAL_PREGUNTAS,
      preguntas_correctas: this.preguntasCorrectas,
      puntaje: this.puntajeTotal,
      tiempo_segundos: this.tiempoSegundos
    });

    const { data } = await this.supabase.getRankingPreguntados();
    this.ranking = data ?? [];
    this.cdr.detectChanges();
  }

  decodificarHTML(texto: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = texto;
    return txt.value;
  }

  claseOpcion(opcion: string): string {
    if (!this.respondio) return '';
    const correcta = this.preguntas[this.indiceActual].correcta;
    if (opcion === correcta) return 'correcta';
    if (opcion === this.opcionSeleccionada) return 'incorrecta';
    return 'opacada';
  }

  confirmarAbandonar() { this.mostrarConfirmAbandonar = true; }
  cancelarAbandonar() { this.mostrarConfirmAbandonar = false; }

  abandonarPartida() {
    clearInterval(this.intervaloTiempo);
    clearInterval(this.intervaloCuenta);
    this.router.navigate(['/home']);
  }

  irAlHome() { this.router.navigate(['/home']); }

  formatearTiempo(): string {
    const m = Math.floor(this.tiempoSegundos / 60).toString().padStart(2, '0');
    const s = (this.tiempoSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get progresoLabel(): string {
    return `Pregunta ${this.indiceActual + 1} / ${this.TOTAL_PREGUNTAS}`;
  }

  get preguntaActual() {
    return this.preguntas[this.indiceActual] ?? null;
  }

  ngOnDestroy() {
    clearInterval(this.intervaloTiempo);
    clearInterval(this.intervaloCuenta);
  }
}