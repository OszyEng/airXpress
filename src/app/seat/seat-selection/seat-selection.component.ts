import { Component, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Toast } from 'bootstrap';

interface Seat {
  number: string;
  available: boolean;
  selected: boolean;
  class: 'negocios' | 'economica';
}

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements AfterViewInit, OnInit {
  @ViewChild('classMismatchToast', { static: true }) toastElement!: ElementRef;
  private toastInstance!: Toast;

  @Input() seatCount: number = 1;
  private _seatClass: string = 'negocios';
  @Input() initialSelectedSeat?: string | null = null;
  @Input() allowedOverrideSeat?: string | null = null;
  @Input() hideConfig: boolean = false;
  @Input() allowCrossClassSelection: boolean = false;
  @Output() selectionChange = new EventEmitter<Seat[]>();

@Input()
get seatClass(): string {
  return this._seatClass;
}

set seatClass(value: string) {
  if (this._seatClass !== value) {
    this._seatClass = value;
    this.resetSelectedSeats();
  }
}
resetSelectedSeats() {
  const allSeats = [...this.businessSeats, ...this.economySeats];
  allSeats.forEach(seat => {
    if (seat.selected) {
      seat.selected = false;
    }
  });
  this.cdr.detectChanges();
}
  businessSeats: Seat[] = this.generateBusinessSeats();
  economySeats: Seat[] = this.generateEconomySeats();

  constructor(private cdr: ChangeDetectorRef, private router: Router, private reservationService: ReservationService) {}

  async ngOnInit(): Promise<void> {
    
    try {
      const rows: any[] = await this.reservationService.getAll();
      const occupied = new Set(rows.map(r => (r.seat_number || r.seat || r.seatNumber || '').toString()));
      const allSeats = [...this.businessSeats, ...this.economySeats];
      allSeats.forEach(s => {
        if (occupied.has(s.number) && s.number !== (this.allowedOverrideSeat || this.initialSelectedSeat || '')) s.available = false;
        else s.available = true;
        s.selected = (this.initialSelectedSeat === s.number);
      });
      this.cdr.detectChanges();
    } catch (e) {
      console.warn('Could not load occupied seats', e);
    }
  }

  ngAfterViewInit() {
    this.toastInstance = new Toast(this.toastElement.nativeElement, {
      delay: 4000,
      animation: true
    });
  }

  private generateBusinessSeats(): Seat[] {
    const rows = ['I', 'G', 'F', 'D', 'C', 'A'];
    const seats: Seat[] = [];
    rows.forEach(row => {
      for (let col = 1; col <= 2; col++) {
        seats.push({
          number: `${row}${col}`,
          available: true,
          selected: false,
          class: 'negocios'
        });
      }
    });
    return seats;
  }

  private generateEconomySeats(): Seat[] {
    const rows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const seats: Seat[] = [];
    rows.forEach(row => {
      for (let col = 3; col <= 7; col++) {
        seats.push({
          number: `${row}${col}`,
          available: true,
          selected: false,
          class: 'economica'
        });
      }
    });
    return seats;
  }

  getSeatClass(seat: Seat): string {
    if (seat.selected) return 'bg-yellow';
    if (!seat.available) return 'bg-primary';
    return 'bg-white';
  }

  isSeatInSelectedClass(seat: Seat): boolean {
    return seat.class === this.seatClass;
  }

  showToast(message: string) {
    const messageEl = document.getElementById('toastMessage');
    if (messageEl) {
      messageEl.textContent = message;
    }
    this.toastInstance.show();
  }
  scrollToConfig() {
  const configPanel = document.querySelector('aside');
  if (configPanel) {
    configPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

  toggleSeatSelection(seat: Seat) {
    if (!this.allowCrossClassSelection && !this.isSeatInSelectedClass(seat)) {
      const other = seat.class === 'negocios' ? 'Negocios' : 'Económica';
      const selected = this.seatClass === 'negocios' ? 'Negocios' : 'Económica';
      this.showToast(`No puedes seleccionar asientos de clase ${other} si has elegido ${selected}.`);
      return;
    }

    if (!seat.available) return;

    const selectedSeats = this.getSelectedSeats();
    if (seat.selected) {
      seat.selected = false;
    } else {
      if (this.seatCount === 1) {
        const all = [...this.businessSeats, ...this.economySeats];
        all.forEach(s => s.selected = false);
        seat.selected = true;
      } else if (selectedSeats.length < this.seatCount) {
        seat.selected = true;
      }
    }

    this.selectionChange.emit(this.getSelectedSeats());

    this.cdr.detectChanges();
  }

  getSelectedSeats(): Seat[] {
    return [...this.businessSeats, ...this.economySeats].filter(s => s.selected);
  }
getSelectedCount(): number {
  return this.getSelectedSeats().length;
}
onSeatClassChange() {
    console.log('Clase cambiada a:', this.seatClass);
  }
onSeatCountChange() {
  const currentSelected = this.getSelectedCount();
  if (currentSelected > this.seatCount) {
    const allSelected = this.getSelectedSeats();
    const toDeselect = allSelected.slice(this.seatCount);
    toDeselect.forEach(seat => seat.selected = false);
    this.cdr.detectChanges();
  }
}

  onSubmit() {
  let selected = this.getSelectedSeats();
  const missing = Math.max(0, this.seatCount - selected.length);

  if (missing > 0) {
    const classPool = (this.seatClass === 'negocios' ? this.businessSeats : this.economySeats)
      .filter(s => s.available && !s.selected);

    const fallbackPool = [...this.businessSeats, ...this.economySeats]
      .filter(s => s.available && !s.selected && ((this.seatClass === 'negocios' ? s.class === 'negocios' : s.class === 'economica') === false));

    const picks: Seat[] = [];

    const pickRandom = (arr: Seat[], n: number) => {
      const copy = arr.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, n);
    };

    let toPick = missing;
    if (classPool.length > 0) {
      const take = Math.min(toPick, classPool.length);
      picks.push(...pickRandom(classPool, take));
      toPick -= take;
    }

    if (toPick > 0 && fallbackPool.length > 0) {
      const take = Math.min(toPick, fallbackPool.length);
      picks.push(...pickRandom(fallbackPool, take));
      toPick -= take;
    }

    if (toPick > 0) {
      const anyPool = [...this.businessSeats, ...this.economySeats].filter(s => s.available && !s.selected && !picks.includes(s));
      const take = Math.min(toPick, anyPool.length);
      picks.push(...pickRandom(anyPool, take));
      toPick -= take;
    }

    picks.forEach(p => p.selected = true);

    selected = this.getSelectedSeats();
    if (picks.length > 0) {
      const n = picks.length;
      this.showToast(`Se asignaron automáticamente ${n} asiento${n > 1 ? 's' : ''}.`);
    }
  }

  if (selected.length === 0) {
    alert('No hay asientos disponibles para reservar.');
    return;
  }

  this.selectionChange.emit(selected);
  console.log('Reservado:', selected.map(s => s.number));
  this.router.navigate(['/passenger-form'], {
    state: {
      seats: selected,
      seatClass: this.seatClass
    }
  });
  }
}