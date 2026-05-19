import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // AUTH
  async registrar(email: string, password: string, datos: any) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Guarda datos del usuario en la tabla 'usuarios'
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
}