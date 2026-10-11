import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";

// Equivalente di markNotificationsAsRead().
export const POST = mobileRoute(async () => {
  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return new Response(null, { status: 204 });
});
