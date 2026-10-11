import { z } from "zod";
import { PaymentStatus } from "@prisma/client";

// Condivisi da Server Actions (actions/appointments.ts) e route mobile
// (app/api/mobile/appointments), così le regole di validazione restano una sola.

export const appointmentBaseSchema = z.object({
  customerId: z.string().min(1, "Seleziona un cliente."),
  employeeId: z.string().min(1).optional().nullable(),
  serviceType: z.string().min(2, "Seleziona una prestazione.").max(100),
  startTime: z.string().datetime({ message: "Data/ora di inizio non valida." }),
  endTime: z.string().datetime({ message: "Data/ora di fine non valida." }),
  price: z.coerce
    .number({ invalid_type_error: "Il prezzo deve essere un numero." })
    .min(0, "Il prezzo non può essere negativo."),
  paymentStatus: z.nativeEnum(PaymentStatus).default("PENDING"),
  notes: z.string().optional().nullable(),
});

export const appointmentSchema = appointmentBaseSchema.refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: "L'orario di fine deve essere successivo all'inizio.", path: ["endTime"] }
);

export const appointmentUpdateSchema = appointmentBaseSchema.partial().refine(
  (d) => !d.startTime || !d.endTime || new Date(d.endTime) > new Date(d.startTime),
  { message: "L'orario di fine deve essere successivo all'inizio.", path: ["endTime"] }
);

export type AppointmentInput = z.infer<typeof appointmentBaseSchema>;

// Stessa forma restituita da getAppointments: cliente ed operatrice inclusi.
export const appointmentInclude = {
  customer: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
  employee: { select: { id: true, firstName: true, lastName: true } },
} as const;
