import * as SecureStore from "expo-secure-store";
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "expo-router";
import { useColorScheme } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { View } from "react-native";
import { THEME_VARS, getThemeColors, type Scheme, type ThemeColors } from "./palette";

// Come sul web (localStorage "theme"): la scelta resta salvata sul telefono;
// finché non si sceglie, segue il tema del sistema.
const THEME_KEY = "lafemme.theme";

interface ThemeContextValue {
  scheme: Scheme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const scheme: Scheme = colorScheme === "dark" ? "dark" : "light";

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark") setColorScheme(saved);
      })
      .catch(() => {});
  }, [setColorScheme]);

  const toggleTheme = useCallback(() => {
    const next: Scheme = scheme === "dark" ? "light" : "dark";
    setColorScheme(next);
    SecureStore.setItemAsync(THEME_KEY, next).catch(() => {});
  }, [scheme, setColorScheme]);

  const colors = useMemo(() => getThemeColors(scheme), [scheme]);

  const navigationTheme = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.foreground,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  const value = useMemo(() => ({ scheme, colors, toggleTheme }), [scheme, colors, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        <View style={THEME_VARS[scheme]} className="flex-1 bg-background">
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve essere usato dentro <ThemeProvider>");
  return ctx;
}
