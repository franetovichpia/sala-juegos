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
  cargando = false;

  async registrar() {
    this.errorMsg = '';
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
}