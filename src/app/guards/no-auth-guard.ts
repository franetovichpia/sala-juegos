import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase';

//guard para rutas de invitado, solo si entra.
export const noAuthGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const { data } = await supabase.getSession();
  if (!data.session) {
    //no hay sesion, puede ver login o registro
    return true;
  }
  //ya esta logueado, lo manda al home
  router.navigate(['/home']);
  return false;
};