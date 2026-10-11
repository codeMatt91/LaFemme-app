// Forme JSON di GET /api/mobile/finance (come getFinancialSummary/getExpenses
// sul web: prezzi e importi Decimal come stringhe, date ISO).

export const EXPENSE_CATEGORIES = [
  "AFFITTO",
  "UTENZE",
  "MATERIALI",
  "PERSONALE",
  "MARKETING",
  "MANUTENZIONE",
  "ALTRO",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface FinancialSummary {
  appointments: { startTime: string; price: string; serviceType: string }[];
  expenses: { date: string; amount: string; category: string }[];
}

export interface ExpenseRecord {
  id: string;
  amount: string;
  description: string;
  category: ExpenseCategory;
  date: string;
}

export interface FinanceData {
  summary: FinancialSummary;
  expenses: ExpenseRecord[];
}

export interface ExpenseInput {
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
}

export type Granularity = "day" | "month" | "year";

export interface ChartPoint {
  label: string;
  entrate: number;
  uscite: number;
  profitto: number;
}
