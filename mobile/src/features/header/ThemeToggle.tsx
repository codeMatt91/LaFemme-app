import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export function ThemeToggle() {
  const { scheme, colors, toggleTheme } = useTheme();
  const isDark = scheme === "dark";
  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Attiva tema chiaro" : "Attiva tema scuro"}
      hitSlop={6}
      className="p-2"
    >
      <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}
