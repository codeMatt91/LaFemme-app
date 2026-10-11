import { mobileRoute } from "@/lib/mobileAuth";
import { actionResultResponse, isNotFound, notFound } from "@/lib/mobileResponses";
import { deleteServiceTypeRecord, updateServiceTypeRecord } from "@/lib/serviceTypes";

type Context = { params: Promise<{ id: string }> };

// Equivalente di updateServiceType.
export const PATCH = mobileRoute<Context>(
  async (req, _user, { params }) => {
    const { id } = await params;
    try {
      return actionResultResponse(await updateServiceTypeRecord(id, await req.json().catch(() => null)));
    } catch (error) {
      if (isNotFound(error)) return notFound("Prestazione non trovata.");
      throw error;
    }
  },
  { admin: true }
);

// Equivalente di deleteServiceType.
export const DELETE = mobileRoute<Context>(
  async (_req, _user, { params }) => {
    const { id } = await params;
    try {
      return actionResultResponse(await deleteServiceTypeRecord(id), 204);
    } catch (error) {
      if (isNotFound(error)) return notFound("Prestazione non trovata.");
      throw error;
    }
  },
  { admin: true }
);
