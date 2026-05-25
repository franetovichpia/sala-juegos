import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Home } from './pages/home/home';
import { QuienSoy } from './pages/quien-soy/quien-soy';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';
import { Ahorcado } from './pages/juegos/ahorcado/ahorcado';
import { MayorMenor } from './pages/juegos/mayor-menor/mayor-menor';
import { Preguntados } from './pages/juegos/preguntados/preguntados';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [noAuthGuard] },
  { path: 'registro', component: Registro, canActivate: [noAuthGuard] },
  { path: 'home', component: Home },
  { path: 'quien-soy', component: QuienSoy, canActivate: [authGuard] },
  { path: 'juegos/ahorcado', component: Ahorcado, canActivate: [authGuard] },
  { path: 'juegos/mayor-menor', component: MayorMenor, canActivate: [authGuard] },
  { path: 'juegos/preguntados', component: Preguntados, canActivate: [authGuard] },
];