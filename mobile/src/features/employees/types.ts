import type { Role } from "@/types";

// Forma restituita da GET /api/mobile/users (come UserRecord sul web).
export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  /** Obbligatoria in creazione; in modifica si invia solo se va cambiata. */
  password?: string;
}
