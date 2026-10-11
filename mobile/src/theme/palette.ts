import { vars } from "nativewind";

// Stessi colori di app/globals.css del web (tema chiaro e .dark), come
// triplette RGB per le variabili CSS usate in tailwind.config.js.
const light = {
  "--background": "255 255 255",
  "--foreground": "28 23 25",
  "--card": "255 255 255",
  "--card-foreground": "28 23 25",
  "--primary": "221 29 74",
  "--primary-foreground": "255 255 255",
  "--secondary": "246 244 244",
  "--secondary-foreground": "28 23 25",
  "--muted": "246 244 244",
  "--muted-foreground": "120 109 113",
  "--accent": "252 232 237",
  "--accent-foreground": "135 18 45",
  "--destructive": "239 67 67",
  "--destructive-foreground": "255 255 255",
  "--border": "232 227 229",
  "--input": "232 227 229",
};

const dark: typeof light = {
  "--background": "22 18 20",
  "--foreground": "243 242 242",
  "--card": "28 23 25",
  "--card-foreground": "243 242 242",
  "--primary": "232 74 111",
  "--primary-foreground": "255 255 255",
  "--secondary": "45 37 39",
  "--secondary-foreground": "243 242 242",
  "--muted": "45 37 39",
  "--muted-foreground": "146 135 138",
  "--accent": "77 25 37",
  "--accent-foreground": "243 165 183",
  "--destructive": "207 48 48",
  "--destructive-foreground": "255 255 255",
  "--border": "56 46 49",
  "--input": "56 46 49",
};

export type Scheme = "light" | "dark";

export const PALETTE = { light, dark };

// Variabili da applicare alla View radice: tutte le classi (bg-background,
// text-foreground, ...) cambiano colore insieme al tema.
export const THEME_VARS = { light: vars(light), dark: vars(dark) };

const toRgb = (triplet: string) => `rgb(${triplet.split(" ").join(", ")})`;

// Colori come stringhe, per le prop che non accettano classi (icone, navigazione).
export function getThemeColors(scheme: Scheme) {
  const p = PALETTE[scheme];
  return {
    background: toRgb(p["--background"]),
    card: toRgb(p["--card"]),
    foreground: toRgb(p["--foreground"]),
    mutedForeground: toRgb(p["--muted-foreground"]),
    primary: toRgb(p["--primary"]),
    primaryForeground: toRgb(p["--primary-foreground"]),
    destructive: toRgb(p["--destructive"]),
    border: toRgb(p["--border"]),
    success: scheme === "dark" ? "rgb(74, 222, 128)" : "rgb(22, 163, 74)",
  };
}

export type ThemeColors = ReturnType<typeof getThemeColors>;
