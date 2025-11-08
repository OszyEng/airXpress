import { Injectable, inject } from '@angular/core';
import { Reservation } from '../models/reservation.model';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const PRICES = {
  negocios: 1200,
  economica: 600
};

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  async reserve(seatNumber: string, passengerName: string, idNumber: string, hasLuggage: boolean, classType: 'negocios' | 'economica', userEmail: string): Promise<{ success: boolean; message?: string; price?: number }> {
    try {
      const payload = { seatNumber, passengerName, cui: idNumber, hasLuggage, classType, userEmail };
      const res = await firstValueFrom(this.http.post<any>('/api/reservations', payload));
      return { success: true, price: res.price };
    } catch (e: any) {
      return { success: false, message: e?.error?.error || e?.message || 'Error' };
    }
  }

  async modify(cui: string, oldSeat: string, newSeat: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await firstValueFrom(this.http.put<any>('/api/reservations/modify', { cui, oldSeat, newSeat }));
      return { success: res?.success === true, message: res?.message || 'Modificado' };
    } catch (e: any) {
      return { success: false, message: e?.error?.error || e?.message || 'Error modificando' };
    }
  }

  async cancel(cui: string, seat: string): Promise<{ success: boolean; message: string }> {
    try {
      const url = `/api/reservations?cui=${encodeURIComponent(cui)}&seat=${encodeURIComponent(seat)}`;
      const res = await firstValueFrom(this.http.delete<any>(url));
      return { success: res?.success === true, message: 'Reserva cancelada' };
    } catch (e: any) {
      return { success: false, message: e?.error?.error || e?.message || 'Error cancelando' };
    }
  }

  getSeatClass(seatNumber: string): 'negocios' | 'economica' {
    return /^[A-I][12]$/.test(seatNumber) ? 'negocios' : 'economica';
  }

  getPrice(classType: 'negocios' | 'economica', isVIP: boolean): number {
    const base = PRICES[classType];
    return isVIP ? Math.round(base * 0.9) : base;
  }

  async getAll(): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>('/api/reservations'));
    } catch (_) { return []; }
  }

  async getByUser(email: string): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>(`/api/reservations?userEmail=${encodeURIComponent(email)}`));
    } catch (_) { return []; }
  }

  async loadFromXML(reservations: any[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;
    const currentUser = this.auth.getCurrentUser();

    for (const r of reservations) {
      try {
        const seat = r.seatNumber || r.seat;
        const passenger = r.passengerName || r.name;
        const idNumber = r.idNumber || r.cui || r.id;
        const hasLuggage = !!r.hasLuggage;
        const classType: 'negocios' | 'economica' = (r.class as any) === 'negocios' ? 'negocios' : 'economica';
        const userEmail = r.userEmail || currentUser?.email || '';

        const res = await this.reserve(seat, passenger, idNumber, hasLuggage, classType, userEmail);
        if (res.success) success++; else errors++;
      } catch (_) {
        errors++;
      }
    }

    return { success, errors };
  }
}