import { prisma } from "@/lib/prisma";
import { mobileRoute } from "@/lib/mobileAuth";
import { actionResultResponse } from "@/lib/mobileResponses";
import { USER_SELECT, createUserRecord } from "@/lib/users";

// Equivalente di getAllUsers (pagina Dipendenti): solo per gli Admin.
export const GET = mobileRoute(
  async () => {
    const users = await prisma.user.findMany({ select: USER_SELECT, orderBy: { firstName: "asc" } });
    return Response.json({ users });
  },
  { admin: true }
);

// Equivalente di createUser.
export const POST = mobileRoute(
  async (req) => actionResultResponse(await createUserRecord(await req.json().catch(() => null)), 201),
  { admin: true }
);
