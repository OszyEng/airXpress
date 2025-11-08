import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XmlService } from '../shared/xml.service';
import { ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-xml-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xml-upload.component.html'
})
export class XmlUploadComponent {
  loading = false;
  result: any = null;

  constructor(
    private xmlService: XmlService,
    private reservationService: ReservationService
  ) {}

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.loading = true;
    const start = performance.now();

    try {
      const reservations = await this.xmlService.parseXML(file);
      this.reservationService.loadFromXML(reservations);
      const time = Math.round(performance.now() - start);
      this.result = {
        success: reservations.length,
        errors: 0,
        time
      };
    } catch (err) {
      this.result = { success: 0, errors: 1, time: 0 };
    } finally {
      this.loading = false;
    }
  }

  loadDiagram() {
    window.location.href = '/seat-selection';
  }
}