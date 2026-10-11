import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { Pressable, Text, View } from "react-native";
import { formatCurrency } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import type { ExpenseRecord } from "./types";

interface Props {
  expenses: ExpenseRecord[];
  deletingId: string | null;
  onAdd: () => void;
  onDelete: (expense: ExpenseRecord) => void;
}

// Come la tabella "Spese del periodo" del web, a righe impilate per il telefono.
export function ExpensesCard({ expenses, deletingId, onAdd, onDelete }: Props) {
  const { colors, scheme } = useTheme();
  const red = scheme === "dark" ? "#f87171" : "#dc2626";
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <View className="overflow-hidden rounded-xl border border-border bg-card">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="font-semibold text-foreground">Spese del periodo</Text>
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5"
        >
          <Ionicons name="add" size={16} color={colors.primaryForeground} />
          <Text className="text-sm font-medium text-primary-foreground">Aggiungi spesa</Text>
        </Pressable>
      </View>

      {expenses.length === 0 ? (
        <Text className="px-4 py-8 text-center text-sm text-muted-foreground">Nessuna spesa registrata nel periodo</Text>
      ) : (
        <>
          {expenses.map((e) => (
            <View
              key={e.id}
              className={`flex-row items-center gap-3 border-b border-border px-4 py-3 ${deletingId === e.id ? "opacity-50" : ""}`}
            >
              <View className="flex-1 gap-1">
                <Text className="text-foreground">{e.description}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-muted-foreground">{format(new Date(e.date), "dd/MM/yyyy")}</Text>
                  <Text className="overflow-hidden rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                    {e.category}
                  </Text>
                </View>
              </View>
              <Text className="font-medium" style={{ color: red }}>
                -{formatCurrency(parseFloat(e.amount))}
              </Text>
              <Pressable
                onPress={() => onDelete(e)}
                disabled={deletingId === e.id}
                accessibilityRole="button"
                accessibilityLabel={`Elimina spesa: ${e.description}`}
                hitSlop={6}
                className="rounded p-1.5"
              >
                <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
          <View className="flex-row items-center justify-between bg-secondary px-4 py-2.5">
            <Text className="text-sm font-semibold text-foreground">Totale</Text>
            <Text className="mr-9 font-semibold" style={{ color: red }}>
              -{formatCurrency(total)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
