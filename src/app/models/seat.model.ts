export interface Seat {
  number: string;
  class: 'negocios' | 'economica';
  available: boolean;
  selected?: boolean;
}