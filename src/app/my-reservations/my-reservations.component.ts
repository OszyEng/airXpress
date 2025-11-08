import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reservations.component.html'
})
export class MyReservationsComponent implements OnInit {
  reservations: any[] = [];

  constructor(private reservationService: ReservationService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) this.load(user.email);
  }

  async load(email: string) {
    this.reservations = await this.reservationService.getByUser(email);
  }

  goModify(r: any) {
    this.router.navigate(['/modify'], { state: { reservation: r } });
  }

  goCancel(r: any) {
    this.router.navigate(['/cancel'], { state: { reservation: r } });
  }

  priceFor(r: any): number {
    if (r == null) return 0;
    if (typeof r.price === 'number') return r.price;
    if (r.price) {
      const parsed = Number(r.price);
      if (!Number.isNaN(parsed)) return parsed;
    }

    const current = this.auth.getCurrentUser();
    const isVIP = !!current?.isVIP;
    const classType = (r.class_type || r.class) === 'negocios' ? 'negocios' : 'economica';
    return this.reservationService.getPrice(classType as any, isVIP);
  }
}
