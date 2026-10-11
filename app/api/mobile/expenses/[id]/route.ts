import { mobileRoute } from "@/lib/mobileAuth";
import { actionResultResponse, isNotFound, notFound } from "@/lib/mobileResponses";
import { deleteExpenseRecord, updateExpenseRecord } from "@/lib/expenses";

type Context = { params: Promise<{ id: string }> };

// Equivalente di updateExpense.
export const PATCH = mobileRoute<Context>(
  async (req, _user, { params }) => {
    const { id } = await params;
    try {
      return actionResultResponse(await updateExpenseRecord(id, await req.json().catch(() => null)));
    } catch (error) {
      if (isNotFound(error)) return notFound("Spesa non trovata.");
      throw error;
    }
  },
  { admin: true }
);

// Equivalente di deleteExpense.
export const DELETE = mobileRoute<Context>(
  async (_req, _user, { params }) => {
    const { id } = await params;
    try {
      await deleteExpenseRecord(id);
    } catch (error) {
      if (isNotFound(error)) return notFound("Spesa non trovata.");
      throw error;
    }
    return new Response(null, { status: 204 });
  },
  { admin: true }
);
