import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { validationError } from "@/lib/mobileResponses";
import { appointmentInclude, appointmentSchema } from "@/lib/validation/appointments";

const rangeSchema = z
  .object({
    from: z.string().datetime({ message: "Parametro 'from' non valido." }),
    to: z.string().datetime({ message: "Parametro 'to' non valido." }),
  })
  .refine((r) => new Date(r.to) >= new Date(r.from), { message: "Intervallo di date non valido." });

// Equivalente di getAppointments(from, to).
export const GET = mobileRoute(async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = rangeSchema.safeParse(params);
  if (!parsed.success) return validationError(parsed.error);

  const appointments = await prisma.appointment.findMany({
    where: { startTime: { gte: new Date(parsed.data.from), lte: new Date(parsed.data.to) } },
    include: appointmentInclude,
    orderBy: { startTime: "asc" },
  });
  return Response.json({
    appointments: appointments.map((a) => ({ ...a, price: a.price.toString() })),
  });
});

// Equivalente di createAppointment.
export const POST = mobileRoute(async (req) => {
  const parsed = appointmentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const appointment = await prisma.appointment.create({
    data: {
      ...parsed.data,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
    },
  });

  revalidatePath("/calendar");
  return Response.json({ id: appointment.id }, { status: 201 });
});
