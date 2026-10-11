import Ionicons from "@expo/vector-icons/Ionicons";
import { Linking, Pressable, Text, View } from "react-native";
import { formatDateOnly } from "@/lib/dates";
import type { Customer } from "./types";

interface Props {
  customer: Customer;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomerCard({ customer: c, deleting, onEdit, onDelete }: Props) {
  const name = `${c.firstName} ${c.lastName}`;
  return (
    <View className={`rounded-xl border border-border bg-background p-4 ${deleting ? "opacity-50" : ""}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="font-medium text-foreground">
            {c.lastName} {c.firstName}
          </Text>
          {c.phoneNumber && (
            <Pressable
              onPress={() => Linking.openURL(`tel:${c.phoneNumber}`)}
              accessibilityRole="link"
              accessibilityLabel={`Chiama ${name}`}
              className="mt-0.5 flex-row items-center gap-1"
            >
              <Ionicons name="call-outline" size={12} color="hsl(340, 5%, 45%)" />
              <Text className="text-sm text-muted-foreground">{c.phoneNumber}</Text>
            </Pressable>
          )}
          {c.email && <Text className="mt-0.5 text-sm text-muted-foreground">{c.email}</Text>}
          {c.notes && (
            <Text numberOfLines={1} className="mt-0.5 text-xs text-muted-foreground">
              {c.notes}
            </Text>
          )}
        </View>
        <View className="flex-row gap-1">
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Modifica ${name}`}
            hitSlop={4}
            className="rounded-lg p-2"
          >
            <Ionicons name="pencil-outline" size={18} color="hsl(340, 10%, 10%)" />
          </Pressable>
          <Pressable
            onPress={onDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel={`Elimina ${name}`}
            hitSlop={4}
            className="rounded-lg p-2"
          >
            <Ionicons name="trash-outline" size={18} color="hsl(0, 84%, 60%)" />
          </Pressable>
        </View>
      </View>
      <View className="mt-2 flex-row items-center gap-3">
        <Text className="overflow-hidden rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
          {c._count.appointments} appuntamenti
        </Text>
        {c.birthDate && (
          <Text className="text-xs text-muted-foreground">Nato/a il {formatDateOnly(c.birthDate)}</Text>
        )}
      </View>
    </View>
  );
}
