import { mobileRoute } from "@/lib/mobileAuth";

export const GET = mobileRoute(async (_req, user) => Response.json({ user }));
