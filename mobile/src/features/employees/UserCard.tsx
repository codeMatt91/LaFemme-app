import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { Pressable, Text, View } from "react-native";
import type { UserRecord } from "./types";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  user: UserRecord;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// Come la scheda utente della pagina Dipendenti web su schermo piccolo.
export function UserCard({ user: u, deleting, onEdit, onDelete }: Props) {
  const { colors } = useTheme();
  const name = `${u.firstName} ${u.lastName}`;
  const isAdmin = u.role === "ADMIN";
  return (
    <View className={`rounded-xl border border-border bg-card p-4 ${deleting ? "opacity-50" : ""}`}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text numberOfLines={1} className="font-medium text-foreground">
            {name}
          </Text>
          <Text numberOfLines={1} className="text-sm text-muted-foreground">
            {u.email}
          </Text>
        </View>
        <View className="flex-row gap-1">
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Modifica ${name}`}
            hitSlop={4}
            className="rounded-lg p-2"
          >
            <Ionicons name="pencil-outline" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel={`Elimina ${name}`}
            hitSlop={4}
            className="rounded-lg p-2"
          >
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
      <View className="mt-2 flex-row items-center gap-3">
        <View
          className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${isAdmin ? "bg-primary/10" : "bg-secondary"}`}
        >
          <Ionicons
            name={isAdmin ? "shield-outline" : "person-outline"}
            size={12}
            color={isAdmin ? colors.primary : colors.mutedForeground}
          />
          <Text className={`text-xs font-semibold ${isAdmin ? "text-primary" : "text-muted-foreground"}`}>
            {isAdmin ? "Admin" : "Dipendente"}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">{format(new Date(u.createdAt), "dd/MM/yyyy")}</Text>
      </View>
    </View>
  );
}
