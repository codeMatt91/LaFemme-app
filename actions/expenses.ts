"use server";

import { requireAdmin } from "@/lib/auth";
import { ActionResult } from "@/lib/actionResult";
import {
  createExpenseRecord,
  deleteExpenseRecord,
  findExpenses,
  findFinancialSummary,
  updateExpenseRecord,
  type ExpenseInput,
} from "@/lib/expenses";

export async function getExpenses(from: Date, to: Date) {
  await requireAdmin();
  return findExpenses(from, to);
}

export async function createExpense(data: ExpenseInput): Promise<ActionResult> {
  await requireAdmin();
  return createExpenseRecord(data);
}

export async function updateExpense(id: string, data: ExpenseInput): Promise<ActionResult> {
  await requireAdmin();
  return updateExpenseRecord(id, data);
}

export async function deleteExpense(id: string) {
  await requireAdmin();
  await deleteExpenseRecord(id);
}

export async function getFinancialSummary(from: Date, to: Date) {
  await requireAdmin();
  return findFinancialSummary(from, to);
}
