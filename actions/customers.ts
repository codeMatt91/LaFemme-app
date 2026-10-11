"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult, zodErrorToMessage } from "@/lib/actionResult";
import { customerSchema, type CustomerInput } from "@/lib/validation/customers";

export async function getCustomers(search?: string) {
  await requireAuth();
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search } },
          ],
        }
      : undefined,
    include: { _count: { select: { appointments: true } } },
    orderBy: { lastName: "asc" },
  });
}

export async function getCustomerById(id: string) {
  await requireAuth();
  return prisma.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { startTime: "desc" },
        take: 10,
      },
      _count: { select: { appointments: true } },
    },
  });
}

export async function createCustomer(data: CustomerInput): Promise<ActionResult> {
  await requireAuth();
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };
  await prisma.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  return { success: true, data: null };
}

export async function updateCustomer(id: string, data: CustomerInput): Promise<ActionResult> {
  await requireAuth();
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };
  await prisma.customer.update({ where: { id }, data: parsed.data });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { success: true, data: null };
}

export async function deleteCustomer(id: string) {
  await requireAuth();
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
