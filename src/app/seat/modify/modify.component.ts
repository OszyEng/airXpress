import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { Toast } from 'bootstrap';
import { AuthService } from '../../auth/auth.service';
import { SeatSelectionComponent } from '../seat-selection/seat-selection.component';

@Component({
  selector: 'app-modify',
  standalone: true,
  imports: [CommonModule, FormsModule, SeatSelectionComponent],
  templateUrl: './modify.component.html',
  styleUrls: ['./modify.component.css']
})
export class ModifyComponent implements OnInit {
  @ViewChild('actionToast') toastEl!: ElementRef;
  private toast!: Toast;

  reservations: any[] = [];
  selectedReservation: any = null;
  newSeat = '';
  businessSeats: any[] = [];
  economySeats: any[] = [];
  private allReservations: any[] = [];

  constructor(private reservationService: ReservationService, private auth: AuthService, private cdr: ChangeDetectorRef) {
    const navRes = (history && (history as any).state && (history as any).state.reservation) || null;
    if (navRes) this.selectedReservation = navRes;
  }

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      await this.loadUserReservations(user.email);
    }
    await this.loadOccupiedSeats();
    const navRes = (history && (history as any).state && (history as any).state.reservation) || null;
    if (navRes && user && (navRes.user_email === user.email || navRes.user === user.email)) {
      this.selectedReservation = navRes;
      this.newSeat = (this.selectedReservation.seat_number || this.selectedReservation.seat || this.selectedReservation.seatNumber) || '';
    }
  }

  ngAfterViewInit() {
    this.toast = new Toast(this.toastEl.nativeElement, { delay: 4000 });
  }

  async loadUserReservations(email: string) {
    this.reservations = await this.reservationService.getByUser(email);
  }

  onSelectionChange(seats: any[]) {
    if (seats && seats.length) this.newSeat = seats[0].number;
    else this.newSeat = '';
  }

  selectForModify(r: any) {
    this.selectedReservation = r;
    this.newSeat = '';
    this.loadOccupiedSeats();
  }

  async modifyReservation() {
    if (!this.selectedReservation) return;
    const oldSeat = this.selectedReservation.seat_number || this.selectedReservation.seat || this.selectedReservation.seatNumber;
    const res = await this.reservationService.modify(this.selectedReservation.cui, oldSeat, this.newSeat);
    const el = document.getElementById('actionMessage');
    if (res.success) {
      if (el) el.textContent = 'Actualizado con éxito. Se ha enviado el correo de confirmación.';
      this.toastEl.nativeElement.className = 'toast align-items-center text-white bg-primary border-0';
    } else {
      if (el) el.textContent = res.message || 'Error modificando reserva';
      this.toastEl.nativeElement.className = 'toast align-items-center text-black bg-white border border-warning';
    }
    this.toast.show();
    if (res.success) {
      const user = this.auth.getCurrentUser();
      if (user) this.loadUserReservations(user.email);
      this.selectedReservation = null;
      this.newSeat = '';
      await this.loadOccupiedSeats();
    }
  }

  private generateBusinessSeats(): any[] {
    const rows = ['I', 'G', 'F', 'D', 'C', 'A'];
    const seats: any[] = [];
    rows.forEach(row => {
      for (let col = 1; col <= 2; col++) {
        seats.push({ number: `${row}${col}`, available: true, selected: false, class: 'negocios' });
      }
    });
    return seats;
  }

  private generateEconomySeats(): any[] {
    const rows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const seats: any[] = [];
    rows.forEach(row => {
      for (let col = 3; col <= 7; col++) {
        seats.push({ number: `${row}${col}`, available: true, selected: false, class: 'economica' });
      }
    });
    return seats;
  }

  private async loadOccupiedSeats() {
    try {
      this.allReservations = await this.reservationService.getAll();
    } catch (_) {
      this.allReservations = [];
    }
    const occupied = new Set(this.allReservations.map(r => (r.seat_number || r.seat || r.seatNumber || '').toString()));
    this.businessSeats = this.generateBusinessSeats();
    this.economySeats = this.generateEconomySeats();

    const originalSeat = this.selectedReservation ? (this.selectedReservation.seat_number || this.selectedReservation.seat || this.selectedReservation.seatNumber) : null;

    const allSeats = [...this.businessSeats, ...this.economySeats];
    allSeats.forEach(s => {
      if (occupied.has(s.number) && s.number !== originalSeat) s.available = false;
      else s.available = true;
      s.selected = (s.number === originalSeat);
      if (s.selected) this.newSeat = s.number;
    });
    this.cdr.detectChanges();
  }

  getSeatClass(seat: any): string {
    if (seat.selected) return 'bg-yellow';
    if (!seat.available) return 'bg-primary';
    return 'bg-white';
  }

  toggleSeatSelection(seat: any) {
    const originalSeat = this.selectedReservation ? (this.selectedReservation.seat_number || this.selectedReservation.seat || this.selectedReservation.seatNumber) : null;
    if (!seat.available && seat.number !== originalSeat) return;
    const allSeats = [...this.businessSeats, ...this.economySeats];
    allSeats.forEach(s => s.selected = false);
    seat.selected = true;
    this.newSeat = seat.number;
    this.cdr.detectChanges();
  }

  originalPrice(): number {
    if (!this.selectedReservation) return 0;
    const r = this.selectedReservation;
    if (typeof r.price === 'number') return r.price;
    const parsed = Number(r.price);
    if (!Number.isNaN(parsed)) return parsed;
    const classType = (r.class_type || r.class) === 'negocios' ? 'negocios' : 'economica';
    return this.reservationService.getPrice(classType as any, !!this.auth.getCurrentUser()?.isVIP);
  }

  newPrice(): number {
    const orig = this.originalPrice();
    return Math.round(orig * 1.1);
  }
}
