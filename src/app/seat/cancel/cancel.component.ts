import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { Toast } from 'bootstrap';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-cancel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {
  @ViewChild('actionToast') toastEl!: ElementRef;
  private toast!: Toast;

  reservations: any[] = [];

  constructor(private reservationService: ReservationService, private auth: AuthService) {
    const navRes = (history && (history as any).state && (history as any).state.reservation) || null;
    if (navRes) {
      // If navigated with a reservation, show only it
      this.reservations = [navRes];
    }
  }

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) this.loadUserReservations(user.email);
  }

  ngAfterViewInit() {
    this.toast = new Toast(this.toastEl.nativeElement, { delay: 4000 });
  }

  async loadUserReservations(email: string) {
    this.reservations = await this.reservationService.getByUser(email);
  }

  async cancelReservationFor(r: any) {
    const res = await this.reservationService.cancel(r.cui, r.seat_number || r.seat || r.seatNumber);
    const el = document.getElementById('actionMessageCancel');
    if (el) el.textContent = res.message;
    this.toastEl.nativeElement.className = res.success ? 'toast align-items-center text-white bg-primary border-0' : 'toast align-items-center text-black bg-white border border-warning';
    this.toast.show();
    if (res.success) {
      const user = this.auth.getCurrentUser();
      if (user) this.loadUserReservations(user.email);
    }
  }
}
