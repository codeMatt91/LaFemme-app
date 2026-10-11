import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import type { ServiceType } from "@/features/calendar/types";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  serviceType: ServiceType;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function formatServicePrice(price: string) {
  return `€ ${Number(price).toFixed(2)}`;
}

export function formatServiceDuration(minutes: number | null) {
  return minutes != null ? `${minutes} min` : "—";
}

// Come la scheda prestazione delle Impostazioni web su schermo piccolo.
export function ServiceTypeCard({ serviceType: s, deleting, onEdit, onDelete }: Props) {
  const { colors } = useTheme();
  return (
    <View className={`flex-row items-center justify-between rounded-xl border border-border bg-card p-4 ${deleting ? "opacity-50" : ""}`}>
      <View className="flex-1 pr-2">
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: s.color }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Text className="font-medium text-foreground">{s.name}</Text>
        </View>
        <Text className="text-sm text-muted-foreground">
          {formatServicePrice(s.defaultPrice)} · {formatServiceDuration(s.durationMinutes)}
        </Text>
      </View>
      <View className="flex-row gap-1">
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Modifica ${s.name}`}
          hitSlop={4}
          className="rounded-lg p-2"
        >
          <Ionicons name="pencil-outline" size={18} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={onDelete}
          disabled={deleting}
          accessibilityRole="button"
          accessibilityLabel={`Elimina ${s.name}`}
          hitSlop={4}
          className="rounded-lg p-2"
        >
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );
}
