import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // AUTH
  async registrar(email: string, password: string, datos: any) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    await this.supabase.from('usuarios').insert({
      id: data.user?.id,
      email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      edad: datos.edad
    });

    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthChange(callback: (session: any) => void) {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  // CHAT
  async getMensajes() {
    return await this.supabase
      .from('mensajes')
      .select('*')
      .order('fecha', { ascending: true });
  }

  async enviarMensaje(usuario_email: string, mensaje: string) {
    return await this.supabase
      .from('mensajes')
      .insert({ usuario_email, mensaje });
  }

  suscribirseAlChat(callback: (mensaje: any) => void) {
    return this.supabase
      .channel('chat-global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes'
      }, (payload: any) => {
        callback(payload.new);
      })
      .subscribe();
  }

  // AHORCADO
  async guardarResultadoAhorcado(data: {
    usuario_email: string;
    palabras_totales: number;
    palabras_ganadas: number;
    puntaje: number;
    tiempo_segundos: number;
  }) {
    return await this.supabase
      .from('resultados_ahorcado')
      .insert(data);
  }

  async getRankingAhorcado() {
    return await this.supabase
      .from('resultados_ahorcado')
      .select('*')
      .order('puntaje', { ascending: false })
      .limit(10);
  }

  // MAYOR O MENOR
async guardarResultadoMayorMenor(data: {
  usuario_email: string;
  rondas_totales: number;
  rondas_ganadas: number;
  puntaje: number;
  tiempo_segundos: number;
}) {
  return await this.supabase
    .from('resultados_mayor_menor')
    .insert(data);
}

async getRankingMayorMenor() {
  return await this.supabase
    .from('resultados_mayor_menor')
    .select('*')
    .order('puntaje', { ascending: false })
    .limit(10);
}

// PREGUNTADOS
async guardarResultadoPreguntados(data: {
  usuario_email: string;
  preguntas_totales: number;
  preguntas_correctas: number;
  puntaje: number;
  tiempo_segundos: number;
}) {
  return await this.supabase
    .from('resultados_preguntados')
    .insert(data);
}

async getRankingPreguntados() {
  return await this.supabase
    .from('resultados_preguntados')
    .select('*')
    .order('puntaje', { ascending: false })
    .limit(10);
}
}