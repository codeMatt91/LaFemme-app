import { mobileRoute } from "@/lib/mobileAuth";
import { actionResultResponse, isNotFound, notFound } from "@/lib/mobileResponses";
import { deleteUserRecord, updateUserRecord } from "@/lib/users";

type Context = { params: Promise<{ id: string }> };

// Equivalente di updateUser.
export const PATCH = mobileRoute<Context>(
  async (req, _user, { params }) => {
    const { id } = await params;
    try {
      return actionResultResponse(await updateUserRecord(id, await req.json().catch(() => null)));
    } catch (error) {
      if (isNotFound(error)) return notFound("Utente non trovato.");
      throw error;
    }
  },
  { admin: true }
);

// Equivalente di deleteUser.
export const DELETE = mobileRoute<Context>(
  async (_req, user, { params }) => {
    const { id } = await params;
    try {
      return actionResultResponse(await deleteUserRecord(user.id, id), 204);
    } catch (error) {
      if (isNotFound(error)) return notFound("Utente non trovato.");
      throw error;
    }
  },
  { admin: true }
);
