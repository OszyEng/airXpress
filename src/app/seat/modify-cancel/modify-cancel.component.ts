import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// HeaderComponent not required here; header is rendered globally in AppComponent
import { ReservationService } from '../../services/reservation.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-modify-cancel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modify-cancel.component.html',
  styleUrls: ['./modify-cancel.component.css']
})
export class ModifyCancelComponent {
  @ViewChild('actionToast') toastEl!: ElementRef;
  private toast!: Toast;

  modifyCUI = '';
  modifySeat = '';
  newSeat = '';
  cancelCUI = '';
  cancelSeat = '';

  constructor(private reservationService: ReservationService) {}

  ngAfterViewInit() {
    this.toast = new Toast(this.toastEl.nativeElement, { delay: 4000 });
  }

  modifyReservation() {
    this.reservationService.modify(this.modifyCUI, this.modifySeat, this.newSeat).then(res => {
      this.showToast(res.message, res.success ? 'success' : 'error');
      if (res.success) this.clearModify();
    });
  }

  cancelReservation() {
    this.reservationService.cancel(this.cancelCUI, this.cancelSeat).then(res => {
      this.showToast(res.message, res.success ? 'success' : 'error');
      if (res.success) this.clearCancel();
    });
  }

  showToast(message: string, kind: 'success' | 'error') {
    const el = document.getElementById('actionMessage');
    if (el) el.textContent = message;
    // Map logical kinds into classes that respect the 4-color palette.
    if (kind === 'success') {
      this.toastEl.nativeElement.className = 'toast align-items-center text-white bg-primary border-0';
    } else {
      // For errors use white background with black text and a yellow border
      this.toastEl.nativeElement.className = 'toast align-items-center text-black bg-white border border-warning';
      // adjust close button style for white bg
      const closeBtn = this.toastEl.nativeElement.querySelector('.btn-close');
      if (closeBtn) closeBtn.classList.remove('btn-close-white');
    }
    this.toast.show();
  }

  clearModify() {
    this.modifyCUI = this.modifySeat = this.newSeat = '';
  }

  clearCancel() {
    this.cancelCUI = this.cancelSeat = '';
  }
}