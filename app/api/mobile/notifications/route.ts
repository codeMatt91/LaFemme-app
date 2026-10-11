import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";

// Equivalente di getNotifications(): ultime 30 notifiche dei promemoria email.
export const GET = mobileRoute(async () => {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return Response.json({ notifications });
});
