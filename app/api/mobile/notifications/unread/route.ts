import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";

// Equivalente di hasUnreadNotifications(): pallino rosso sulla campanella.
export const GET = mobileRoute(async () => {
  const count = await prisma.notification.count({ where: { read: false } });
  return Response.json({ hasUnread: count > 0 });
});
