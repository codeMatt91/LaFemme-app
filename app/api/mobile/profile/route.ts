import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { validateProfileImage } from "@/lib/profileImage";

// Equivalente di getMyProfile().
export const GET = mobileRoute(async (_req, user) => {
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { image: true, createdAt: true },
  });
  return Response.json({ image: dbUser.image, createdAt: dbUser.createdAt.toISOString() });
});

const imageBodySchema = z.object({ image: z.string() });

// Equivalente di updateProfileImage(dataUrl).
export const PUT = mobileRoute(async (req, user) => {
  const parsed = imageBodySchema.safeParse(await req.json().catch(() => null));
  const error = validateProfileImage(parsed.success ? parsed.data.image : null);
  if (!parsed.success || error) {
    return Response.json({ error: error ?? "Formato immagine non valido." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { image: parsed.data.image },
  });
  return Response.json({ success: true });
});
