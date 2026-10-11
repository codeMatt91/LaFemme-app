import { z } from "zod";

// Condiviso da Server Actions (actions/customers.ts) e route mobile
// (app/api/mobile/customers), così le regole di validazione restano una sola.
export const customerSchema = z.object({
  firstName: z.string().min(2, "Il nome è obbligatorio (min. 2 caratteri).").max(50, "Il nome è troppo lungo."),
  lastName: z.string().min(2, "Il cognome è obbligatorio (min. 2 caratteri).").max(50, "Il cognome è troppo lungo."),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().email("Inserisci un indirizzo email valido.").nullable().optional(),
  birthDate: z.coerce
    .date({ invalid_type_error: "La data di nascita non è valida." })
    .max(new Date(), "La data di nascita non può essere nel futuro.")
    .optional()
    .nullable(),
  notes: z.string().max(500, "Le note sono troppo lunghe (max 500 caratteri).").optional().nullable(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
