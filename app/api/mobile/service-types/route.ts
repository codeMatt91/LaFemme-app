import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";

// Equivalente di getServiceTypes: colore per la legenda, prezzo e durata per il modulo.
export const GET = mobileRoute(async () => {
  const serviceTypes = await prisma.serviceType.findMany({
    select: { id: true, name: true, color: true, defaultPrice: true, durationMinutes: true },
    orderBy: { name: "asc" },
  });
  return Response.json({
    serviceTypes: serviceTypes.map((s) => ({ ...s, defaultPrice: s.defaultPrice.toString() })),
  });
});
