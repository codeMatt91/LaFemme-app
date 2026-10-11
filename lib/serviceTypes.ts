import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ActionResult, zodErrorToMessage } from "@/lib/actionResult";

// Regole delle tipologie di prestazione, condivise da actions/serviceTypes.ts
// (web) e dalle route /api/mobile/service-types (app). Il controllo del ruolo
// ADMIN lo fa il chiamante.

export const serviceTypeSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio (min. 2 caratteri).").max(50, "Il nome è troppo lungo."),
  defaultPrice: z.coerce.number().nonnegative("Il prezzo non può essere negativo."),
  durationMinutes: z.coerce
    .number()
    .int("La durata deve essere un numero intero di minuti.")
    .min(1, "La durata deve essere di almeno 1 minuto.")
    .max(1440, "La durata non può superare i 1440 minuti (24 ore).")
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Il colore deve essere in formato esadecimale (#RRGGBB)."),
});

export type ServiceTypeInput = z.infer<typeof serviceTypeSchema>;

function revalidateServiceTypePages() {
  revalidatePath("/settings");
  revalidatePath("/calendar");
  revalidatePath("/finance");
}

export async function createServiceTypeRecord(data: unknown): Promise<ActionResult> {
  const parsed = serviceTypeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };

  const existing = await prisma.serviceType.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { success: false, error: "Esiste già una prestazione con questo nome." };

  await prisma.serviceType.create({ data: parsed.data });
  revalidateServiceTypePages();
  return { success: true, data: null };
}

export async function updateServiceTypeRecord(id: string, data: unknown): Promise<ActionResult> {
  const parsed = serviceTypeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };

  const existing = await prisma.serviceType.findUnique({ where: { name: parsed.data.name } });
  if (existing && existing.id !== id) return { success: false, error: "Esiste già una prestazione con questo nome." };

  await prisma.serviceType.update({ where: { id }, data: parsed.data });
  revalidateServiceTypePages();
  return { success: true, data: null };
}

export async function deleteServiceTypeRecord(id: string): Promise<ActionResult> {
  await prisma.serviceType.delete({ where: { id } });
  revalidateServiceTypePages();
  return { success: true, data: null };
}
