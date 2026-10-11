// Forme JSON restituite dalle route /api/mobile (date come stringhe ISO,
// prezzi Decimal come stringhe).

export type PaymentStatus = "PAID" | "PENDING" | "OPTIONAL";

export type ViewMode = "month" | "week" | "day";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Customer extends Person {
  phoneNumber: string | null;
}

export interface ServiceType {
  id: string;
  name: string;
  color: string;
  defaultPrice: string;
  durationMinutes: number | null;
}

export interface Appointment {
  id: string;
  customerId: string;
  employeeId: string | null;
  serviceType: string;
  startTime: string;
  endTime: string;
  price: string;
  paymentStatus: PaymentStatus;
  notes: string | null;
  customer: Customer;
  employee: Person | null;
}

export interface AppointmentInput {
  customerId: string;
  employeeId: string | null;
  serviceType: string;
  startTime: string;
  endTime: string;
  price: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
}
