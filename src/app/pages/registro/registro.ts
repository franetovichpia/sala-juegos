import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  nombre = '';
  apellido = '';
  edad = '';
  email = '';
  password = '';
  errorMsg = '';
  errores: { [key: string]: string } = {};
  cargando = false;

  validar(): boolean {
    this.errores = {};

    if (!this.nombre.trim())
      this.errores['nombre'] = 'El nombre es requerido.';

    if (!this.apellido.trim())
      this.errores['apellido'] = 'El apellido es requerido.';

    const edadNum = Number(this.edad);
    if (!this.edad)
      this.errores['edad'] = 'La edad es requerida.';
    else if (isNaN(edadNum) || edadNum < 1 || edadNum > 120)
      this.errores['edad'] = 'Ingresá una edad válida.';

    if (!this.email.trim())
      this.errores['email'] = 'El email es requerido.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email))
      this.errores['email'] = 'El email no es válido.';

    if (!this.password)
      this.errores['password'] = 'La contraseña es requerida.';
    else if (this.password.length < 8)
      this.errores['password'] = 'Mínimo 8 caracteres.';
    else if (!/[0-9]/.test(this.password))
      this.errores['password'] = 'Debe contener al menos un número.';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password))
      this.errores['password'] = 'Debe contener al menos un carácter especial.';
    else if (!/[A-Z]/.test(this.password))
      this.errores['password'] = 'Debe contener al menos una mayúscula.';

    return Object.keys(this.errores).length === 0;
  }

  async registrar() {
    this.errorMsg = '';
    if (!this.validar()) return;

    this.cargando = true;
    try {
      await this.supabase.registrar(this.email, this.password, {
        nombre: this.nombre,
        apellido: this.apellido,
        edad: Number(this.edad)
      });
      this.router.navigate(['/home']);
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        this.errorMsg = 'El email ya está registrado.';
      } else {
        this.errorMsg = 'Ocurrió un error al registrarse.';
      }
    } finally {
      this.cargando = false;
    }
  }
  mostrarPassword = false;
}