"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/lib/actionResult";
import {
  USER_SELECT,
  createUserRecord,
  deleteUserRecord,
  updateUserRecord,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/users";

export async function getEmployees() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: USER_SELECT,
    orderBy: { firstName: "asc" },
  });
}

export async function getAllUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    select: USER_SELECT,
    orderBy: { firstName: "asc" },
  });
}

export async function createUser(data: CreateUserInput): Promise<ActionResult> {
  await requireAdmin();
  return createUserRecord(data);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<ActionResult> {
  await requireAdmin();
  return updateUserRecord(id, data);
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  return deleteUserRecord(admin.id, id);
}
