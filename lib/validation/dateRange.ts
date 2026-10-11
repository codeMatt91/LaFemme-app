import { z } from "zod";

// Intervallo ?from=&to= (ISO) usato dalle route /api/mobile che leggono un periodo.
export const dateRangeSchema = z
  .object({
    from: z.string().datetime({ message: "Parametro 'from' non valido." }),
    to: z.string().datetime({ message: "Parametro 'to' non valido." }),
  })
  .refine((r) => new Date(r.to) >= new Date(r.from), { message: "Intervallo di date non valido." });
