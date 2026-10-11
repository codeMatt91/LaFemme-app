// Scala dell'asse Y con valori "tondi" (0, 50, 100...), usata dal grafico
// nell'app e da quelli del report PDF.

function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep));
  const base = Math.pow(10, exponent);
  const fraction = rawStep / base;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * base;
}

export function niceScale(values: number[], tickCount = 5) {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  if (min === max) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };

  const step = niceStep((max - min) / (tickCount - 1));
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return { min: niceMin, max: niceMax, ticks };
}

/** Mostra al massimo `max` etichette sull'asse X, a intervalli regolari. */
export function labelStride(count: number, max: number): number {
  return Math.max(1, Math.ceil(count / max));
}

export const SERIES_COLORS = {
  entrate: "#22c55e", // hsl(142 71% 45%) del web
  uscite: "#ef4444", // hsl(0 84% 60%)
};
