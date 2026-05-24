import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase';

interface Mensaje {
  id: string;
  usuario_email: string;
  mensaje: string;
  fecha: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  usuarioActual = '';
  private suscripcion: any;

  // Estados: 'cerrado' | 'mini' | 'fullscreen'
  estado: 'cerrado' | 'mini' | 'fullscreen' = 'cerrado';
  estaLogueado = false;
  mensajesNoVistos = 0;

  async ngOnInit() {
    this.supabase.onAuthChange(async session => {
      this.estaLogueado = !!session;
      this.usuarioActual = session?.user?.email ?? '';
      if (this.estaLogueado) {
        await this.cargarMensajes();
        this.suscribirseAlChat();
      }
      this.cdr.detectChanges();
    });

    const { data } = await this.supabase.getSession();
    this.estaLogueado = !!data.session;
    this.usuarioActual = data.session?.user?.email ?? '';
    if (this.estaLogueado) {
      await this.cargarMensajes();
      this.suscribirseAlChat();
    }
  }

  async cargarMensajes() {
    const { data, error } = await this.supabase.getMensajes();
    if (!error && data) {
      this.mensajes = data;
      this.cdr.detectChanges();
    }
  }

  suscribirseAlChat() {
    this.suscripcion = this.supabase.suscribirseAlChat((nuevo) => {
      this.mensajes.push(nuevo);
      if (this.estado === 'cerrado') {
        this.mensajesNoVistos++;
      }
      this.cdr.detectChanges();
    });
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;
    await this.supabase.enviarMensaje(this.usuarioActual, this.nuevoMensaje.trim());
    this.nuevoMensaje = '';
  }

  abrir() {
    this.estado = 'mini';
    this.mensajesNoVistos = 0;
  }

  cerrar() {
    this.estado = 'cerrado';
  }

  toggleFullscreen() {
    this.estado = this.estado === 'fullscreen' ? 'mini' : 'fullscreen';
  }

  ngAfterViewChecked() {
    if (this.mensajesContainer) {
      const el = this.mensajesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
  
  ngOnDestroy() {
    if (this.suscripcion) {
      this.suscripcion.unsubscribe();
    }
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  esMio(email: string): boolean {
    return email === this.usuarioActual;
  }
}