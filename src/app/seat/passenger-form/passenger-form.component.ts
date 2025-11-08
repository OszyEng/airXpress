import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Toast } from 'bootstrap';
import { ReservationService } from '../../services/reservation.service';

interface Passenger {
  name: string;
  id: string;
  maletas: boolean;
}

@Component({
  selector: 'app-passenger-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './passenger-form.component.html',
  styleUrls: ['./passenger-form.component.css']
})
export class PassengerFormComponent implements OnInit {
  @ViewChild('successToast') toastEl!: ElementRef;
  private toast!: Toast;

  selectedSeats: any[] = [];
  seatClass: string = '';
  passengers: Passenger[] = [];
  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    const data = history.state;
    this.selectedSeats = data.seats || [];
    this.seatClass = data.seatClass || 'económica';

    // Inicializar formulario vacío
    this.passengers = this.selectedSeats.map(() => ({
      name: '', id: '', maletas: false
    }));
  }

  ngAfterViewInit() {
    this.toast = new Toast(this.toastEl.nativeElement, { delay: 3000 });
  }

  goBack() {
    window.history.back();
  }

  async onSubmit() {
    // For each selected seat, call backend to reserve
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const userEmail = currentUser?.email;
    if (!userEmail) {
      alert('Debes iniciar sesión antes de reservar');
      return;
    }

    const results: any[] = [];
    for (let i = 0; i < this.selectedSeats.length; i++) {
      const seat = this.selectedSeats[i];
      const p = this.passengers[i];
      // call reservation service
      try {
        const res = await this.reservationService.reserve(
          seat.number || seat,
          p.name,
          p.id,
          !!p.maletas,
          this.seatClass === 'negocios' ? 'negocios' : 'economica',
          userEmail
        );
        results.push({ seat: seat.number || seat, ok: res.success, price: res.price, message: res.message });
      } catch (e) {
        results.push({ seat: seat.number || seat, ok: false, message: 'Error interno' });
      }
    }

    localStorage.setItem('reservation_result', JSON.stringify(results));
    this.showSuccess();
    setTimeout(() => {
      window.location.href = '/confirmation';
    }, 2000);
  }

  showSuccess() {
    this.toast.show();
  }
}