import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  supabase: SupabaseClient;
  // el cliente de supabase, hace todas las llamadas

  constructor() {
    //inicializa el cliente cc credenciales del environment
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // AUTH
  async registrar(email: string, password: string, datos: any) {
    //crea usuario en el sist de auth de supabase
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Guarda datos del usuario en la tabla 'usuarios'
    // la contraseña no se guarda aca.
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
    //valida email y contraseña contra supabase
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    //cierra la sesion
  }

  getUser() {
    return this.supabase.auth.getUser();
    //devuelve usuario actual
  }

  getSession() {
    return this.supabase.auth.getSession();
    //devuelve la sesion activa
  }

  onAuthChange(callback: (session: any) => void) {
    //suscribe a cambios de sesion
    //cada vez que cmabia ejecuta el callback con nueva sesion
    this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }


  // (sprint 3)
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
}