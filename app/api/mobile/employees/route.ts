import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";

// Elenco operatrici per il calendario (stessi campi di app/(dashboard)/calendar/page.tsx).
export const GET = mobileRoute(async () => {
  const employees = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
  return Response.json({ employees });
});
