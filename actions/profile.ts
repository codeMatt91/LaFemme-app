"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateProfileImage } from "@/lib/profileImage";

export async function getMyProfile(): Promise<{ image: string | null; createdAt: string }> {
  const user = await requireAuth();
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { image: true, createdAt: true },
  });
  return { image: dbUser.image, createdAt: dbUser.createdAt.toISOString() };
}

export async function updateProfileImage(dataUrl: string): Promise<{ success: boolean }> {
  const user = await requireAuth();

  const error = validateProfileImage(dataUrl);
  if (error) throw new Error(error);

  await prisma.user.update({
    where: { id: user.id },
    data: { image: dataUrl },
  });

  return { success: true };
}
