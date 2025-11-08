import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  getReports(reservations: Reservation[], users: User[]) {
    const businessOccupied = reservations.filter(r => {
      const cls = (r as any).class || (r as any).class_type || '';
      if (cls) return cls === 'negocios';
      const seat = (r as any).seatNumber || (r as any).seat_number || (r as any).seat || '';
      return /^[A-I][12]$/.test(seat);
    }).length;
    const economyOccupied = reservations.filter(r => {
      const cls = (r as any).class || (r as any).class_type || '';
      if (cls) return cls === 'economica';
      const seat = (r as any).seatNumber || (r as any).seat_number || (r as any).seat || '';
      return !/^[A-I][12]$/.test(seat) && seat !== '';
    }).length;
    const businessTotal = 12;
    const economyTotal = 45;

    return {
      totalUsers: users.length,
      totalReservations: reservations.length,
      businessOccupied,
      economyOccupied,
      businessFree: businessTotal - businessOccupied,
      economyFree: economyTotal - economyOccupied,
      vipUsers: users.filter(u => u.isVIP).length
    };
  }
}