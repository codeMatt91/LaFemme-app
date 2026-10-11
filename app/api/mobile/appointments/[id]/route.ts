import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { isNotFound, notFound, validationError } from "@/lib/mobileResponses";
import { appointmentUpdateSchema } from "@/lib/validation/appointments";

type Context = { params: Promise<{ id: string }> };

// Equivalente di updateAppointment.
export const PATCH = mobileRoute<Context>(async (req, _user, { params }) => {
  const { id } = await params;
  const parsed = appointmentUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    await prisma.appointment.update({
      where: { id },
      data: {
        ...parsed.data,
        startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : undefined,
        endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : undefined,
      },
    });
  } catch (error) {
    if (isNotFound(error)) return notFound("Appuntamento non trovato.");
    throw error;
  }

  revalidatePath("/calendar");
  return Response.json({ id });
});

// Equivalente di deleteAppointment.
export const DELETE = mobileRoute<Context>(async (_req, _user, { params }) => {
  const { id } = await params;
  try {
    await prisma.appointment.delete({ where: { id } });
  } catch (error) {
    if (isNotFound(error)) return notFound("Appuntamento non trovato.");
    throw error;
  }

  revalidatePath("/calendar");
  return new Response(null, { status: 204 });
});
