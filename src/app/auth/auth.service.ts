import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface User {
  email: string;
  password?: string;
  name?: string;
  isVIP?: boolean;
  reservations?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    const stored = localStorage.getItem('currentUser');
    if (stored) this.currentUser.next(JSON.parse(stored));
  }

  async register(user: User): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await firstValueFrom(this.http.post<any>('/api/auth/register', user));
      const u: User = { email: res.email, name: res.name };
      this.currentUser.next(u);
      localStorage.setItem('currentUser', JSON.stringify(u));
      return { success: true };
    } catch (e: any) {
      const msg = e?.error?.error || e?.error?.message || e?.message || 'Error registrando';
      return { success: false, message: msg };
    }
  }
  isAllowedDomain(email: string): boolean {
    return /@(gmail|outlook)\.com$/.test(String(email).toLowerCase());
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.http.post<any>('/api/auth/login', { email, password }));
      const u: User = { email: res.email, name: res.name, isVIP: res.isVIP, reservations: res.reservations };
      this.currentUser.next(u);
      localStorage.setItem('currentUser', JSON.stringify(u));
      return true;
    } catch (e) {
      return false;
    }
  }

  logout() {
    this.currentUser.next(null);
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  async refreshUser(email: string) {
    try {
      const res = await firstValueFrom(this.http.get<any>(`/api/users/${encodeURIComponent(email)}`));
      this.currentUser.next(res);
      localStorage.setItem('currentUser', JSON.stringify(res));
    } catch (_) {}
  }
}