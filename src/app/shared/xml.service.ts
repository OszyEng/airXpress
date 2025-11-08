import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class XmlService {
  generateXML(reservations: Reservation[]): string {
    let xml = `<flightReservation>\n`;
    reservations.forEach(r => {
      const seatNumber = (r as any).seatNumber || (r as any).seat_number || (r as any).seat || '';
      const passengerName = (r as any).passengerName || (r as any).passenger_name || (r as any).passenger || (r as any).name || '';
      const userEmail = (r as any).user || (r as any).user_email || (r as any).userEmail || '';
      const idNumber = (r as any).idNumber || (r as any).cui || (r as any).id || '';
      const hasLuggage = (r as any).hasLuggage !== undefined ? (r as any).hasLuggage : !!(r as any).maletas;
      const reservationDate = (r as any).reservationDate || (r as any).reservation_date || '';
      const classType = (r as any).class || (r as any).class_type || '';
      const price = (r as any).price != null ? (r as any).price : '';

      xml += `  <flightSeat>\n`;
      xml += `    <seatNumber>${seatNumber}</seatNumber>\n`;
      xml += `    <passengerName>${passengerName}</passengerName>\n`;
      xml += `    <user>${userEmail}</user>\n`;
      xml += `    <idNumber>${idNumber}</idNumber>\n`;
      xml += `    <hasLuggage>${hasLuggage}</hasLuggage>\n`;
      xml += `    <class>${classType}</class>\n`;
      xml += `    <price>${price}</price>\n`;
      xml += `    <reservationDate>${reservationDate}</reservationDate>\n`;
      xml += `  </flightSeat>\n`;
    });
    xml += `</flightReservation>`;
    return xml;
  }

  downloadXML(xml: string, filename: string = 'reservas.xml') {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async parseXML(file: File): Promise<Reservation[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const seats = xmlDoc.getElementsByTagName('flightSeat');
        const reservations: Reservation[] = [];
        const errors: string[] = [];

        for (let i = 0; i < seats.length; i++) {
          try {
            const seat = seats[i];
            const res: Reservation = {
              seatNumber: seat.getElementsByTagName('seatNumber')[0].textContent || '',
              passengerName: seat.getElementsByTagName('passengerName')[0].textContent || '',
              user: seat.getElementsByTagName('user')[0].textContent || '',
              idNumber: seat.getElementsByTagName('idNumber')[0].textContent || '',
              hasLuggage: seat.getElementsByTagName('hasLuggage')[0].textContent === 'true',
              reservationDate: seat.getElementsByTagName('reservationDate')[0].textContent || '',
              class: seat.getElementsByTagName('seatNumber')[0].textContent?.match(/^[A-I][12]$/) ? 'negocios' : 'economica',
              price: 0
            };
            reservations.push(res);
          } catch (err) {
            errors.push(`Fila ${i + 1}: formato inválido`);
          }
        }
        resolve(reservations);
      };
      reader.readAsText(file);
    });
  }
}