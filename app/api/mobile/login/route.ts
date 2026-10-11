import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobileAuth";
import type { SessionUser } from "@/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Login dell'app mobile: stesse credenziali del web, ma restituisce un token
// Bearer invece di impostare un cookie di sessione.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Email o password non validi." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  const passwordMatch = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;
  if (!user || !passwordMatch) {
    return Response.json({ error: "Email o password non validi." }, { status: 401 });
  }

  const sessionUser: SessionUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  const token = await signMobileToken(user.id);
  return Response.json({ token, user: sessionUser });
}
