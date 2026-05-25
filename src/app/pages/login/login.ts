import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMsg = '';
  cargando = false;
  mostrarPassword = false;

  usuariosRapidos = [
    { email: 'franetovmariapia@gmail.com', password: '123456' },
    { email: 'test1@test.com', password: '123456' },
    { email: 'test2@test.com', password: '123456' },
  ];

  async ingresar() {
    this.errorMsg = '';
    this.cargando = true;
    try {
      await this.supabase.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg = 'Email o contraseña incorrectos.';
    } finally {
      this.cargando = false;
    }
  }

  async loginRapido(email: string, password: string) {
    this.email = email;
    this.password = password;
    await this.ingresar();
  }
}