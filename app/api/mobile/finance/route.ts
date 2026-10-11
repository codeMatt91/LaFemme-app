import { mobileRoute } from "@/lib/mobileAuth";
import { validationError } from "@/lib/mobileResponses";
import { findExpenses, findFinancialSummary } from "@/lib/expenses";
import { dateRangeSchema } from "@/lib/validation/dateRange";

// Equivalente di getFinancialSummary + getExpenses (pagina Finanze, export PDF):
// entrate (appuntamenti pagati) e spese del periodo, solo per gli Admin.
export const GET = mobileRoute(
  async (req) => {
    const parsed = dateRangeSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
    if (!parsed.success) return validationError(parsed.error);

    const from = new Date(parsed.data.from);
    const to = new Date(parsed.data.to);
    const [summary, expenses] = await Promise.all([findFinancialSummary(from, to), findExpenses(from, to)]);
    return Response.json({ summary, expenses });
  },
  { admin: true }
);
