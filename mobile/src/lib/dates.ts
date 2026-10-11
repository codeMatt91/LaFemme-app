import { format } from "date-fns";

// Le date "solo giorno" (es. data di nascita, colonna DATE) viaggiano come
// "YYYY-MM-DD" o come ISO a mezzanotte UTC: si leggono solo anno/mese/giorno,
// così il fuso orario del telefono non sposta la data di un giorno.

export function toDateOnlyString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateOnly(value: string): string {
  return format(parseDateOnly(value), "dd/MM/yyyy");
}
