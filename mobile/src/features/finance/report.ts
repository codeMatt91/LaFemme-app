import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from "date-fns";
import { it } from "date-fns/locale";
import { labelStride, niceScale } from "./chartScale";
import type { ExpenseRecord, FinancialSummary } from "./types";

// Report PDF "Esporta mese / Esporta anno": stessi contenuti di
// lib/exportFinancePDF.ts del web (jsPDF + chart.js), qui come pagina HTML con
// grafici SVG che expo-print converte in PDF.

export type ReportPeriod = "month" | "year";

export function reportRange(period: ReportPeriod, now = new Date()) {
  const from = period === "month" ? startOfMonth(now) : startOfYear(now);
  const to = period === "month" ? endOfMonth(now) : endOfYear(now);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function reportFilename(period: ReportPeriod, now = new Date()) {
  return period === "month" ? `report-mese-${format(now, "yyyy-MM")}.pdf` : `report-anno-${format(now, "yyyy")}.pdf`;
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

function formatEur(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount);
}

function formatEurShort(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function sumBy<T>(items: T[], key: (item: T) => string, value: (item: T) => number) {
  const map = new Map<string, number>();
  for (const item of items) map.set(key(item), (map.get(key(item)) ?? 0) + value(item));
  return Array.from(map.entries()).map(([label, v]) => ({ label, value: v }));
}

function pieSvg(slices: { label: string; value: number }[], title: string): string {
  if (slices.length === 0) return `<div class="empty">Nessun dato</div>`;
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = 150, cy = 150, r = 110;
  let angle = -Math.PI / 2;
  const paths = slices.map((slice, i) => {
    const color = PIE_COLORS[i % PIE_COLORS.length];
    const sweep = (slice.value / total) * Math.PI * 2;
    if (slices.length === 1) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${color}" stroke="#fff" stroke-width="2"/>`;
  });
  const legend = slices
    .map(
      (s, i) =>
        `<span class="legend-item"><span class="dot" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span>${escapeHtml(s.label)}</span>`
    )
    .join("");
  return `<div class="pie"><div class="chart-title">${escapeHtml(title)}</div><svg viewBox="0 0 300 300" width="100%">${paths.join("")}</svg><div class="legend">${legend}</div></div>`;
}

function barLineSvg(months: { label: string; entrate: number; uscite: number; netto: number }[]): string {
  const W = 800, H = 320, pad = { top: 40, right: 16, bottom: 28, left: 70 };
  const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
  const scale = niceScale(months.flatMap((m) => [m.entrate, m.uscite, m.netto]), 6);
  const y = (v: number) => pad.top + plotH - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const band = plotW / months.length;
  const barW = band * 0.32;
  const cx = (i: number) => pad.left + band * i + band / 2;
  const stride = labelStride(months.length, 12);

  const grid = scale.ticks
    .map(
      (t) =>
        `<line x1="${pad.left}" x2="${W - pad.right}" y1="${y(t)}" y2="${y(t)}" stroke="#e5e7eb"/><text x="${pad.left - 8}" y="${y(t) + 4}" font-size="12" text-anchor="end" fill="#6b7280">${formatEurShort(t)}</text>`
    )
    .join("");
  const bars = months
    .map((m, i) => {
      const parts = [];
      if (m.entrate > 0) parts.push(`<rect x="${cx(i) - barW}" y="${y(m.entrate)}" width="${barW}" height="${y(0) - y(m.entrate)}" fill="#10b981" stroke="#4e79a7"/>`);
      if (m.uscite > 0) parts.push(`<rect x="${cx(i)}" y="${y(m.uscite)}" width="${barW}" height="${y(0) - y(m.uscite)}" fill="#ef4444" stroke="#e15759"/>`);
      if (i % stride === 0) parts.push(`<text x="${cx(i)}" y="${H - 8}" font-size="12" text-anchor="middle" fill="#6b7280">${escapeHtml(m.label)}</text>`);
      return parts.join("");
    })
    .join("");
  const line = `<polyline points="${months.map((m, i) => `${cx(i)},${y(m.netto)}`).join(" ")}" fill="none" stroke="#111827" stroke-width="2"/>`;
  const dots = months.map((m, i) => `<circle cx="${cx(i)}" cy="${y(m.netto)}" r="4" fill="#111827"/>`).join("");
  const legend = [
    ["#10b981", "Entrate"],
    ["#ef4444", "Uscite"],
    ["#111827", "Netto"],
  ]
    .map(([c, l], i) => `<rect x="${W / 2 - 150 + i * 110}" y="10" width="28" height="10" fill="${c}"/><text x="${W / 2 - 116 + i * 110}" y="19" font-size="12" fill="#374151">${l}</text>`)
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${legend}${grid}${bars}${line}${dots}</svg>`;
}

function table(head: string[], rows: string[][], options: { rightCols?: number[]; foot?: string[]; cellClass?: (row: number, col: number) => string } = {}) {
  const align = (col: number) => (options.rightCols?.includes(col) ? ' class="right"' : "");
  const th = head.map((h, c) => `<th${align(c)}>${h}</th>`).join("");
  const body = rows
    .map(
      (row, r) =>
        `<tr>${row
          .map((cell, c) => {
            const extra = options.cellClass?.(r, c) ?? "";
            const cls = [options.rightCols?.includes(c) ? "right" : "", extra].filter(Boolean).join(" ");
            return `<td${cls ? ` class="${cls}"` : ""}>${cell}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");
  const foot = options.foot ? `<tfoot><tr>${options.foot.map((f, c) => `<td${align(c)}>${f}</td>`).join("")}</tr></tfoot>` : "";
  return `<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody>${foot}</table>`;
}

const STYLES = `
  @page { margin: 14mm; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Helvetica, Arial, sans-serif; color: #111; font-size: 10pt; margin: 0; }
  h1 { font-size: 18pt; text-align: center; margin: 0 0 6px; }
  .period { font-size: 12pt; text-align: center; margin: 0 0 4px; }
  .generated { font-size: 9pt; color: #787878; text-align: center; margin: 0 0 18px; }
  h2 { font-size: 11pt; margin: 18px 0 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { background: #282828; color: #fff; text-align: left; padding: 5px 6px; font-weight: bold; }
  td { padding: 5px 6px; border-bottom: 1px solid #e5e7eb; }
  tbody tr:nth-child(even) td { background: #f5f5f5; }
  tfoot td { background: #282828; color: #fff; font-weight: bold; }
  .kpi td, .kpi th { border: 1px solid #c8c8c8; font-size: 10pt; }
  .right { text-align: right; }
  td.pos { background: #d1fae5 !important; color: #065f46; }
  td.neg { background: #fee2e2 !important; color: #991b1b; }
  .pies { display: flex; gap: 24px; margin-top: 14px; }
  .pie { flex: 1; text-align: center; }
  .chart-title { font-size: 12pt; font-weight: bold; color: #555; margin-bottom: 6px; }
  .legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 12px; font-size: 9pt; margin-top: 6px; }
  .legend-item { display: inline-flex; align-items: center; gap: 4px; }
  .dot { width: 10px; height: 10px; display: inline-block; }
  .empty { color: #787878; font-size: 9pt; padding: 120px 0; text-align: center; flex: 1; }
`;

export function buildReportHtml(
  period: ReportPeriod,
  summary: FinancialSummary,
  expenses: ExpenseRecord[],
  now = new Date()
): string {
  const entrate = summary.appointments.reduce((s, a) => s + parseFloat(a.price), 0);
  const uscite = summary.expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const profitto = entrate - uscite;
  const periodLabel = period === "month" ? format(now, "MMMM yyyy", { locale: it }) : `Anno ${format(now, "yyyy")}`;

  const sections: string[] = [];

  sections.push(`<h1>Report Finanziario</h1>
    <p class="period">${capitalize(periodLabel)}</p>
    <p class="generated">Generato il ${format(now, "dd/MM/yyyy")}</p>
    <h2>Riepilogo</h2>
    <div class="kpi">${table(["Entrate totali", "Uscite totali", "Profitto netto"], [[formatEur(entrate), formatEur(uscite), formatEur(profitto)]])}</div>`);

  if (period === "month") {
    const serviceSlices = sumBy(summary.appointments, (a) => a.serviceType, (a) => parseFloat(a.price));
    const expenseSlices = sumBy(summary.expenses, (e) => e.category, (e) => parseFloat(e.amount));
    sections.push(
      `<div class="pies">${pieSvg(serviceSlices, "Entrate per servizio")}${pieSvg(expenseSlices, "Spese per categoria")}</div>`
    );
  }

  if (period === "year") {
    const year = now.getFullYear();
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(year, i, 1);
      const key = format(d, "yyyy-MM");
      const e = summary.appointments
        .filter((a) => format(new Date(a.startTime), "yyyy-MM") === key)
        .reduce((s, a) => s + parseFloat(a.price), 0);
      const u = summary.expenses
        .filter((x) => format(new Date(x.date), "yyyy-MM") === key)
        .reduce((s, x) => s + parseFloat(x.amount), 0);
      return { label: format(d, "MMM", { locale: it }), entrate: e, uscite: u, netto: e - u };
    });

    sections.push(`<h2>Andamento mensile</h2>${barLineSvg(monthly)}`);
    sections.push(
      `<h2>Riepilogo mensile</h2>${table(
        ["Mese", "Entrate", "Uscite", "Netto"],
        monthly.map((m) => [capitalize(m.label), formatEur(m.entrate), formatEur(m.uscite), formatEur(m.netto)]),
        {
          rightCols: [1, 2, 3],
          foot: [
            "Totale annuale",
            formatEur(monthly.reduce((s, m) => s + m.entrate, 0)),
            formatEur(monthly.reduce((s, m) => s + m.uscite, 0)),
            formatEur(monthly.reduce((s, m) => s + m.netto, 0)),
          ],
          cellClass: (r, c) => (c === 3 ? (monthly[r].netto >= 0 ? "pos" : "neg") : ""),
        }
      )}`
    );
  }

  const aptRows = summary.appointments
    .slice()
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((a) => [format(new Date(a.startTime), "dd/MM/yyyy"), escapeHtml(a.serviceType), formatEur(parseFloat(a.price))]);
  sections.push(
    `<h2>Appuntamenti (pagati)</h2>${table(["Data", "Servizio", "Prezzo"], aptRows.length ? aptRows : [["Nessun appuntamento nel periodo", "", ""]], { rightCols: [2] })}`
  );

  const expRows = expenses
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((e) => [format(new Date(e.date), "dd/MM/yyyy"), escapeHtml(e.description), e.category, formatEur(parseFloat(e.amount))]);
  sections.push(
    `<h2>Spese</h2>${table(["Data", "Descrizione", "Categoria", "Importo"], expRows.length ? expRows : [["Nessuna spesa nel periodo", "", "", ""]], { rightCols: [3] })}`
  );

  return `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>Report Finanziario</title><style>${STYLES}</style></head><body>${sections.join("\n")}</body></html>`;
}
