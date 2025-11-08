import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../shared/report.service';
import { XmlService } from '../shared/xml.service';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  reports: any = {};
  readonly adminEmail = 'servexpressmail@gmail.com';
  isAdmin = false;
  uploadResult: { success: number; errors: number } | null = null;

  constructor(
    private reportService: ReportService,
    private xmlService: XmlService,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    this.isAdmin = !!user && user.email === this.adminEmail;
    if (this.isAdmin) this.loadReports();
  }

  async loadReports() {
    const reservations = await this.reservationService.getAll();
    const users: any[] = [];
    this.reports = this.reportService.getReports(reservations, users);
  }

  downloadXML() {
    this.reservationService.getAll().then(reservations => {
      const xml = this.xmlService.generateXML(reservations);
      this.xmlService.downloadXML(xml);
    });
  }

  async onFileSelected(file: File | null) {
    if (!file) return;
    try {
      const parsed = await this.xmlService.parseXML(file);
      const result = await this.reservationService.loadFromXML(parsed as any);
      this.uploadResult = result;
      
      await this.loadReports();
    } catch (e) {
      this.uploadResult = { success: 0, errors: 1 };
    }
  }
}