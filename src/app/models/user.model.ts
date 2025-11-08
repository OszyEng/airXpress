export interface User {
  email: string;
  password: string;
  name?: string;
  reservations: number;
  isVIP: boolean;
}