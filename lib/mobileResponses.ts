import { Prisma } from "@prisma/client";
import type { ZodError } from "zod";
import { type ActionResult, zodErrorToMessage } from "@/lib/actionResult";

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

// Converte l'esito di una funzione condivisa con le server action: errore di
// regola (email già usata, ultimo Admin, ...) → 400 con il messaggio.
export function actionResultResponse(result: ActionResult, successStatus = 200): Response {
  if (!result.success) return Response.json({ error: result.error }, { status: 400 });
  return successStatus === 204 ? new Response(null, { status: 204 }) : Response.json({ ok: true }, { status: successStatus });
}
