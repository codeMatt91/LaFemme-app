// Specchio di SessionUser in types/index.ts del backoffice.
export type Role = "ADMIN" | "EMPLOYEE";

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}
