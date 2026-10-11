import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ExpenseCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResult, zodErrorToMessage } from "@/lib/actionResult";

// Logica della pagina Finanze, condivisa da actions/expenses.ts (web) e dalle
// route /api/mobile/finance e /api/mobile/expenses (app). Il controllo del
// ruolo ADMIN lo fa il chiamante.

export const expenseSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "L'importo deve essere un numero." })
    .min(0.01, "L'importo deve essere maggiore di zero."),
  description: z.string().min(2, "La descrizione della spesa è obbligatoria.").max(200, "La descrizione è troppo lunga."),
  category: z.nativeEnum(ExpenseCategory).default("ALTRO"),
  date: z.string().datetime({ message: "Data della spesa non valida." }),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export async function findExpenses(from: Date, to: Date) {
  const expenses = await prisma.monthlyExpense.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: "desc" },
  });
  return expenses.map((e) => ({
    ...e,
    amount: e.amount.toString(),
    date: e.date.toISOString(),
  }));
}

// Entrate = appuntamenti PAGATI nel periodo; uscite = spese nel periodo.
export async function findFinancialSummary(from: Date, to: Date) {
  const [appointments, expenses] = await Promise.all([
    prisma.appointment.findMany({
      where: { startTime: { gte: from, lte: to }, paymentStatus: "PAID" },
      select: { startTime: true, price: true, serviceType: true },
    }),
    prisma.monthlyExpense.findMany({
      where: { date: { gte: from, lte: to } },
      select: { date: true, amount: true, category: true },
    }),
  ]);

  return {
    appointments: appointments.map((a) => ({
      startTime: a.startTime.toISOString(),
      price: a.price.toString(),
      serviceType: a.serviceType,
    })),
    expenses: expenses.map((e) => ({
      date: e.date.toISOString(),
      amount: e.amount.toString(),
      category: e.category,
    })),
  };
}

export async function createExpenseRecord(data: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };
  await prisma.monthlyExpense.create({
    data: { ...parsed.data, date: new Date(parsed.data.date) },
  });
  revalidatePath("/finance");
  return { success: true, data: null };
}

export async function updateExpenseRecord(id: string, data: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodErrorToMessage(parsed.error) };
  await prisma.monthlyExpense.update({
    where: { id },
    data: { ...parsed.data, date: new Date(parsed.data.date) },
  });
  revalidatePath("/finance");
  return { success: true, data: null };
}

export async function deleteExpenseRecord(id: string) {
  await prisma.monthlyExpense.delete({ where: { id } });
  revalidatePath("/finance");
}
