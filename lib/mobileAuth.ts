import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/types";

// Token Bearer per l'app mobile (React Native), che non può usare i cookie
// di sessione di NextAuth. Firmato con lo stesso AUTH_SECRET del web, ma con
// un audience dedicato così non è intercambiabile con altri token.
const ISSUER = "lafemme-backoffice";
const AUDIENCE = "lafemme-mobile";
const TOKEN_TTL = "30d";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET non configurato");
  return new TextEncoder().encode(secret);
}

export async function signMobileToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

export class MobileAuthError extends Error {
  constructor(message: string, public status: 401 | 403) {
    super(message);
  }
}

// Equivalente di requireAuth() per le route /api/mobile: verifica il token e
// ricarica l'utente dal DB, così ruolo aggiornato o account eliminato hanno
// effetto subito anche su token già emessi.
export async function requireMobileAuth(req: Request): Promise<SessionUser> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new MobileAuthError("Non autenticato", 401);

  let userId: string | undefined;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    userId = payload.sub;
  } catch {
    throw new MobileAuthError("Sessione scaduta o non valida", 401);
  }
  if (!userId) throw new MobileAuthError("Non autenticato", 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) throw new MobileAuthError("Non autenticato", 401);
  return user;
}

export async function requireMobileAdmin(req: Request): Promise<SessionUser> {
  const user = await requireMobileAuth(req);
  if (user.role !== "ADMIN") throw new MobileAuthError("Accesso non autorizzato", 403);
  return user;
}

// Converte gli errori di autenticazione in risposte JSON; rilancia il resto.
export function mobileAuthErrorResponse(error: unknown): Response {
  if (error instanceof MobileAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  throw error;
}

type MobileHandler<C> = (req: Request, user: SessionUser, context: C) => Promise<Response>;

// Avvolge una route /api/mobile: autentica (e, se richiesto, verifica il ruolo
// ADMIN) prima di eseguire il gestore, e trasforma gli errori di
// autenticazione in risposte 401/403.
export function mobileRoute<C = unknown>(
  handler: MobileHandler<C>,
  options: { admin?: boolean } = {}
) {
  return async (req: Request, context: C): Promise<Response> => {
    let user: SessionUser;
    try {
      user = options.admin ? await requireMobileAdmin(req) : await requireMobileAuth(req);
    } catch (error) {
      return mobileAuthErrorResponse(error);
    }
    return handler(req, user, context);
  };
}
