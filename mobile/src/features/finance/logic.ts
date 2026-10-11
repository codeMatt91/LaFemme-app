import { eachDayOfInterval, eachMonthOfInterval, endOfDay, format, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { parseDateOnly } from "@/lib/dates";
import type { ChartPoint, FinancialSummary, Granularity } from "./types";

// Stessi calcoli di FinanceClient sul web.

export const ALL_SERVICES = "Tutti";

/** Periodo "YYYY-MM-DD" → istanti ISO dall'inizio del primo giorno alla fine dell'ultimo. */
export function toRange(dateFrom: string, dateTo: string) {
  return {
    from: startOfDay(parseDateOnly(dateFrom)).toISOString(),
    to: endOfDay(parseDateOnly(dateTo)).toISOString(),
  };
}

export function buildChartData(
  summary: FinancialSummary,
  dateFrom: string,
  dateTo: string,
  serviceFilter: string,
  granularity: Granularity
): ChartPoint[] {
  const from = parseDateOnly(dateFrom);
  const to = parseDateOnly(dateTo);
  if (to < from) return [];

  const appointments =
    serviceFilter === ALL_SERVICES
      ? summary.appointments
      : summary.appointments.filter((a) => a.serviceType === serviceFilter);

  // "Annuale" sul web raggruppa per mese come "Mensile", su tutto l'anno.
  const byDay = granularity === "day";
  const keyFormat = byDay ? "yyyy-MM-dd" : "yyyy-MM";
  const buckets = byDay ? eachDayOfInterval({ start: from, end: to }) : eachMonthOfInterval({ start: from, end: to });

  return buckets.map((bucket) => {
    const key = format(bucket, keyFormat);
    const entrate = appointments
      .filter((a) => format(new Date(a.startTime), keyFormat) === key)
      .reduce((sum, a) => sum + parseFloat(a.price), 0);
    const uscite = summary.expenses
      .filter((e) => format(new Date(e.date), keyFormat) === key)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return {
      label: byDay ? format(bucket, "d/M") : format(bucket, "MMM yy", { locale: it }),
      entrate,
      uscite,
      profitto: entrate - uscite,
    };
  });
}

export function totals(points: ChartPoint[]) {
  const entrate = points.reduce((s, d) => s + d.entrate, 0);
  const uscite = points.reduce((s, d) => s + d.uscite, 0);
  return { entrate, uscite, profitto: entrate - uscite };
}
