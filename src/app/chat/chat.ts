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
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  usuarioActual = '';
  private suscripcion: any;

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    this.usuarioActual = data.session?.user?.email ?? '';
    await this.cargarMensajes();
    this.suscribirseAlChat();
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
      this.cdr.detectChanges();
    });
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;
    await this.supabase.enviarMensaje(this.usuarioActual, this.nuevoMensaje.trim());
    this.nuevoMensaje = '';
  }

  ngAfterViewChecked() {
    this.scrollAlFinal();
  }

  scrollAlFinal() {
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