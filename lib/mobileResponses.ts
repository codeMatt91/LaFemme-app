import { Prisma } from "@prisma/client";
import type { ZodError } from "zod";
import { zodErrorToMessage } from "@/lib/actionResult";

export function validationError(error: ZodError): Response {
  return Response.json({ error: zodErrorToMessage(error) }, { status: 400 });
}

// Prisma P2025 = record da aggiornare/eliminare non trovato.
export function isNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export function notFound(message = "Elemento non trovato."): Response {
  return Response.json({ error: message }, { status: 404 });
}
