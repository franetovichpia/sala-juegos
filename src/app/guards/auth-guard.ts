import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase';

// guard para rutas protegidas, solo si entra
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  //consulta si hay sesion activa
  const { data } = await supabase.getSession();
  if (data.session) {
    //si hay sesion activa, deja pasar
    return true;
  }
  //si no hay sesion activa, redirige a login
  router.navigate(['/login']);
  return false;
};