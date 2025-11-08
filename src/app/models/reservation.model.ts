export interface Reservation {
  seatNumber: string;
  passengerName: string;
  user: string;
  idNumber: string;
  hasLuggage: boolean;
  reservationDate: string;
  class: 'negocios' | 'economica';
  price: number;
}