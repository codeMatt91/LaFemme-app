import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { isNotFound, notFound, validationError } from "@/lib/mobileResponses";
import { customerSchema } from "@/lib/validation/customers";

type Context = { params: Promise<{ id: string }> };

// Equivalente di updateCustomer.
export const PATCH = mobileRoute<Context>(async (req, _user, { params }) => {
  const { id } = await params;
  const parsed = customerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    await prisma.customer.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isNotFound(error)) return notFound("Cliente non trovato.");
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return Response.json({ id });
});

// Equivalente di deleteCustomer: elimina anche i suoi appuntamenti (cascade).
export const DELETE = mobileRoute<Context>(async (_req, _user, { params }) => {
  const { id } = await params;
  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error) {
    if (isNotFound(error)) return notFound("Cliente non trovato.");
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath("/calendar");
  return new Response(null, { status: 204 });
});
