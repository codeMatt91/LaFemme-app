import { format } from "date-fns";

export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(num);
}
