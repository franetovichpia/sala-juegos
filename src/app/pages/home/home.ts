import { Component, inject, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit {
  @ViewChild('starsCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuarioNombre = '';
  estaLogueado = false;

  ngOnInit() {
    this.supabase.onAuthChange(session => {
      this.estaLogueado = !!session;
      this.usuarioNombre = session?.user?.email ?? '';
      this.cdr.detectChanges();
    });

    this.supabase.getSession().then(({ data }) => {
      this.estaLogueado = !!data.session;
      this.usuarioNombre = data.session?.user?.email ?? '';
      this.cdr.detectChanges();
    });
  }

  async cerrarSesion() {
    await this.supabase.logout();
    this.estaLogueado = false;
    this.usuarioNombre = '';
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const colors = ['#a78bfa', '#06b6d4', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      delta: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1)
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.opacity += p.delta;
        if (p.opacity >= 0.8 || p.opacity <= 0.1) p.delta *= -1;
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }
}