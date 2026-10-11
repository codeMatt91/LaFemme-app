import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { actionResultResponse } from "@/lib/mobileResponses";
import { createServiceTypeRecord } from "@/lib/serviceTypes";

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

// Equivalente di createServiceType (pagina Impostazioni): solo per gli Admin.
export const POST = mobileRoute(
  async (req) => actionResultResponse(await createServiceTypeRecord(await req.json().catch(() => null)), 201),
  { admin: true }
);
