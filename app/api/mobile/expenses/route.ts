import { mobileRoute } from "@/lib/mobileAuth";
import { actionResultResponse } from "@/lib/mobileResponses";
import { createExpenseRecord } from "@/lib/expenses";

// Equivalente di createExpense.
export const POST = mobileRoute(
  async (req) => actionResultResponse(await createExpenseRecord(await req.json().catch(() => null)), 201),
  { admin: true }
);
