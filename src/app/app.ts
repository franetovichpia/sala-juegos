import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase';
import { ChatWidget } from './chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);
  //fuerza a angular a redibujar la vista
  estaLogueado = false;
  //controla que links muestra el navbar
  ngOnInit() {
    //al cargar la app, chequea si esta activa
    this.supabase.getSession().then(({ data }) => {
      this.estaLogueado = !!data.session;
      this.cdr.detectChanges();
      //avisa a angular que cambiaron datos
    });


    // se suscribe a cambios: si el usuario hace login o logout
    // el navbar se actuzalia automaticamente
    this.supabase.onAuthChange(session => {
      this.estaLogueado = !!session;
      this.cdr.detectChanges();
    });
  }
}