import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { validationError } from "@/lib/mobileResponses";
import { customerSchema } from "@/lib/validation/customers";

// Equivalente di getCustomers(): anagrafica con numero di appuntamenti.
// Usato sia dalla scheda Clienti sia dal selettore cliente del calendario.
export const GET = mobileRoute(async () => {
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { appointments: true } } },
    orderBy: { lastName: "asc" },
  });
  return Response.json({ customers });
});

// Equivalente di createCustomer.
export const POST = mobileRoute(async (req) => {
  const parsed = customerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const customer = await prisma.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  return Response.json({ id: customer.id }, { status: 201 });
});
