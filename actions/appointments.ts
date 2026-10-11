"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult, zodErrorToMessage } from "@/lib/actionResult";
import {
  appointmentInclude,
  appointmentSchema,
  appointmentUpdateSchema,
  type AppointmentInput,
} from "@/lib/validation/appointments";

export async function getAppointments(from: Date, to: Date) {
  await requireAuth();
  const appointments = await prisma.appointment.findMany({
    where: { startTime: { gte: from, lte: to } },
    include: appointmentInclude,
    orderBy: { startTime: "asc" },
  });
  return appointments.map((a) => ({
    ...a,
    price: a.price.toString(),
  }));
}

export async function createAppointment(data: AppointmentInput): Promise<ActionResult> {
  await requireAuth();
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };

  await prisma.appointment.create({
    data: {
      ...parsed.data,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
    },
  });

  revalidatePath("/calendar");
  return { success: true, data: null };
}

export async function updateAppointment(id: string, data: Partial<AppointmentInput>): Promise<ActionResult> {
  await requireAuth();
  const parsed = appointmentUpdateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };

  await prisma.appointment.update({
    where: { id },
    data: {
      ...parsed.data,
      startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : undefined,
      endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : undefined,
    },
  });

  revalidatePath("/calendar");
  return { success: true, data: null };
}

export async function deleteAppointment(id: string) {
  await requireAuth();
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/calendar");
}
