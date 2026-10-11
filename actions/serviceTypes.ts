"use server";

import { requireAuth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/lib/actionResult";
import {
  createServiceTypeRecord,
  deleteServiceTypeRecord,
  updateServiceTypeRecord,
  type ServiceTypeInput,
} from "@/lib/serviceTypes";

export async function getServiceTypes() {
  await requireAuth();
  const serviceTypes = await prisma.serviceType.findMany({ orderBy: { name: "asc" } });
  return serviceTypes.map((s) => ({ ...s, defaultPrice: s.defaultPrice.toString() }));
}

export async function createServiceType(data: ServiceTypeInput): Promise<ActionResult> {
  await requireAdmin();
  return createServiceTypeRecord(data);
}

export async function updateServiceType(id: string, data: ServiceTypeInput): Promise<ActionResult> {
  await requireAdmin();
  return updateServiceTypeRecord(id, data);
}

export async function deleteServiceType(id: string): Promise<ActionResult> {
  await requireAdmin();
  return deleteServiceTypeRecord(id);
}
