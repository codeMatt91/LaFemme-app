import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export interface SelectItem {
  value: string;
  label: string;
}

interface Props {
  label: string;
  items: SelectItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Mostra un campo di ricerca sopra l'elenco (come SearchableSelect sul web). */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

// Selettore a tendina che si espande sotto il campo: evita modali annidati
// dentro il modulo appuntamento, che è già un modale.
export function SelectField({
  label,
  items,
  value,
  onChange,
  placeholder,
  searchable = false,
  searchPlaceholder = "Cerca...",
  emptyMessage = "Nessun risultato",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = items.find((i) => i.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between rounded-lg border border-input px-3 py-3"
      >
        <Text numberOfLines={1} className={`flex-1 ${selected ? "text-foreground" : "text-muted-foreground"}`}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="hsl(340, 5%, 45%)" />
      </Pressable>

      {open && (
        <View className="overflow-hidden rounded-lg border border-border">
          {searchable && (
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              autoFocus
              autoCorrect={false}
              className="border-b border-border px-3 py-2.5 text-foreground"
            />
          )}
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" className="max-h-56">
            {filtered.length === 0 ? (
              <Text className="px-3 py-3 text-sm text-muted-foreground">{emptyMessage}</Text>
            ) : (
              filtered.map((item) => (
                <Pressable
                  key={item.value || "__empty"}
                  onPress={() => select(item.value)}
                  className={`px-3 py-3 ${item.value === value ? "bg-accent" : ""}`}
                >
                  <Text className="text-foreground">{item.label}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
