import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

type Trend = "up" | "down";

// Come StatCard del web: etichetta, icona colorata per l'andamento, valore.
export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  trend: Trend;
}) {
  const { scheme } = useTheme();
  const dark = scheme === "dark";
  const tone =
    trend === "up"
      ? { bg: dark ? "rgba(2, 44, 34, 0.5)" : "#d1fae5", fg: dark ? "#34d399" : "#059669" }
      : { bg: dark ? "rgba(69, 10, 10, 0.5)" : "#fee2e2", fg: dark ? "#f87171" : "#dc2626" };
  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <View className="rounded-lg p-2" style={{ backgroundColor: tone.bg }}>
          <Ionicons name={icon} size={16} color={tone.fg} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
    </View>
  );
}
