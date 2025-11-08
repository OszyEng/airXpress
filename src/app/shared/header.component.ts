import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <header class="bg-primary text-white p-3" style="background: var(--ax-primary) !important;">
  <div class="container-fluid">
    <div class="d-flex align-items-center justify-content-between">
      <!-- Logo + Nombre -->
      <div class="d-flex align-items-center gap-3">
        <img 
          [src]="logoUrl" 
          alt="AIRXPRESS" 
          class="img-fluid rounded" 
          style="width: 88px; height: auto; object-fit: contain;" 
        />
        <h1 class="mb-0 fs-4 lh-1">
          <span class="text-white">AIR</span><span class="text-warning fw-bold">XPRESS</span>
        </h1>
      </div>

      <!-- Usuario / Login -->
      <div class="d-flex align-items-center gap-2">
        <ng-container *ngIf="currentUser; else guest">
          <small class="me-3 text-white-50 d-flex align-items-center">{{ currentUser.name || currentUser.email }}
            <span *ngIf="currentUser?.isVIP" class="vip-badge ms-2">VIP</span>
          </small>
          <!-- Hamburger menu -->
          <div class="position-relative" #menuRoot>
            <button class="btn btn-outline-light btn-sm" (click)="toggleMenu($event)" aria-haspopup="true" [attr.aria-expanded]="menuOpen">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>
            <div *ngIf="menuOpen" class="dropdown-menu-custom shadow-sm p-2" role="menu">
              <a class="dropdown-item" (click)="navigate('/seat-selection')">Hacer una reserva</a>
              <a class="dropdown-item" (click)="navigate('/my-reservations')">Mis reservas</a>
              <a *ngIf="currentUser?.email === 'servexpressmail@gmail.com'" class="dropdown-item" (click)="navigate('/reports')">Reportes (admin)</a>
              <a class="dropdown-item" (click)="navigate('/modify')">Modificar reserva</a>
              <a class="dropdown-item" (click)="navigate('/cancel')">Cancelar reserva</a>
              <div class="dropdown-divider"></div>
              <button class="btn btn-primary w-100" (click)="logout()">Cerrar sesión</button>
            </div>
          </div>
        </ng-container>

        <ng-template #guest>
          <a class="btn btn-outline-light btn-sm" [routerLink]="['/login']">
            Iniciar sesión
          </a>
        </ng-template>
      </div>
    </div>

    <!-- Línea separadora opcional -->
    <hr class="border-white opacity-50 my-2" />
  </div>
</header>
  `,
  styles: [
`    .btn-outline-light { border-color: rgba(255,255,255,0.5); font-weight: 500; }
    .btn-outline-light:hover { background: rgba(255,255,255,0.12); border-color: #FFF; }
    .text-warning { color: var(--ax-accent) !important; }
    .dropdown-menu-custom { position: absolute; right: 0; top: calc(100% + 8px); background: var(--ax-light); min-width: 200px; border-radius: 8px; z-index: 2000; }
    .dropdown-item { display: block; padding: 10px 12px; color: var(--ax-text); text-decoration: none; cursor: pointer; }
    .dropdown-item:hover { background: rgba(13,110,253,0.06); color: var(--ax-primary); }
    .dropdown-divider { height: 1px; background: rgba(0,0,0,0.08); margin: 8px 0; }
    .vip-badge { background: var(--ax-accent); color: #000; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 0.75rem; display: inline-block; }
`]
})
export class HeaderComponent {
  logoUrl = 'https://raw.githubusercontent.com/OszyEng/airXpress/refs/heads/main/logo2.png';
  currentUser: any = null;
  menuOpen = false;
  constructor(public auth: AuthService, private router: Router) {
    this.currentUser = this.auth.getCurrentUser();
    this.auth.currentUser$?.subscribe(u => this.currentUser = u);
  }
  toggleMenu(ev?: Event) {
    ev?.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: Event) {
    if (!this.menuOpen) return;
    const path = (ev as any).composedPath?.() || [];
    const clickedInside = path.some((n: any) => {
      try { return n && n.classList && (n.classList.contains('dropdown-menu-custom') || n.classList.contains('btn-outline-light')); } catch { return false; }
    });
    if (!clickedInside) this.menuOpen = false;
  }

  logout() {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  navigate(path: string) {
    this.menuOpen = false;
    this.router.navigate([path]);
  }
}