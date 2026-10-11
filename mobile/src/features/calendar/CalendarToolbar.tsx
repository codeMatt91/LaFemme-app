import Ionicons from "@expo/vector-icons/Ionicons";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { ViewMode } from "./types";
import { useTheme } from "@/theme/ThemeProvider";

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "month", label: "Mese", icon: "grid-outline" },
  { value: "week", label: "Settimana", icon: "calendar-outline" },
  { value: "day", label: "Giorno", icon: "today-outline" },
];

function periodLabel(date: Date, view: ViewMode): string {
  if (view === "month") return format(date, "MMMM yyyy", { locale: it });
  if (view === "week") {
    const start = format(startOfWeek(date, { weekStartsOn: 1 }), "d MMM", { locale: it });
    const end = format(endOfWeek(date, { weekStartsOn: 1 }), "d MMM yyyy", { locale: it });
    return `${start} – ${end}`;
  }
  return format(date, "EEEE d MMMM yyyy", { locale: it });
}

interface Props {
  currentDate: Date;
  view: ViewMode;
  isFetching: boolean;
  onNavigate: (dir: 1 | -1) => void;
  onViewChange: (view: ViewMode) => void;
  onGoToToday: () => void;
  onNew: () => void;
}

export function CalendarToolbar({
  currentDate,
  view,
  isFetching,
  onNavigate,
  onViewChange,
  onGoToToday,
  onNew,
}: Props) {
  const { colors } = useTheme();
  return (
    <View className="gap-2 border-b border-border bg-background px-4 py-3">
      {/* Riga 1: Oggi + navigazione periodo */}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onGoToToday}
          accessibilityRole="button"
          className="rounded-lg border border-border px-3 py-1.5"
        >
          <Text className="text-sm font-medium text-foreground">Oggi</Text>
        </Pressable>

        <View className="flex-1 flex-row items-center justify-center gap-1">
          <Pressable
            onPress={() => onNavigate(-1)}
            accessibilityRole="button"
            accessibilityLabel="Periodo precedente"
            hitSlop={8}
            className="p-1.5"
          >
            <Ionicons name="chevron-back" size={18} color={colors.foreground} />
          </Pressable>
          <Text
            numberOfLines={1}
            className={`flex-shrink text-center text-sm font-semibold capitalize text-foreground ${isFetching ? "opacity-50" : ""}`}
          >
            {periodLabel(currentDate, view)}
          </Text>
          <Pressable
            onPress={() => onNavigate(1)}
            accessibilityRole="button"
            accessibilityLabel="Periodo successivo"
            hitSlop={8}
            className="p-1.5"
          >
            <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
          </Pressable>
        </View>
        <View className="w-5">{isFetching && <ActivityIndicator size="small" />}</View>
      </View>

      {/* Riga 2: vista + nuovo appuntamento */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row overflow-hidden rounded-lg border border-border">
          {VIEW_OPTIONS.map((option) => {
            const active = view === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onViewChange(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 ${active ? "bg-primary" : ""}`}
              >
                <Ionicons name={option.icon} size={14} color={active ? "#FFFFFF" : colors.foreground} />
                <Text className={`text-sm font-medium ${active ? "text-primary-foreground" : "text-foreground"}`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onNew}
          accessibilityRole="button"
          accessibilityLabel="Nuovo appuntamento"
          className="flex-row items-center gap-1 rounded-lg bg-primary px-3 py-1.5"
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
