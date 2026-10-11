export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  email: string | null;
  /** ISO string (colonna DATE: mezzanotte UTC) o null. */
  birthDate: string | null;
  notes: string | null;
  createdAt: string;
  _count: { appointments: number };
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  email: string | null;
  /** "YYYY-MM-DD" o null. */
  birthDate: string | null;
  notes: string | null;
}
