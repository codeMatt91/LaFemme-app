import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";

// Elenco clienti per la scelta nel modulo appuntamento (come getCustomers()
// senza ricerca, ma solo con i campi che servono al selettore).
export const GET = mobileRoute(async () => {
  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true, phoneNumber: true },
    orderBy: { lastName: "asc" },
  });
  return Response.json({ customers });
});
