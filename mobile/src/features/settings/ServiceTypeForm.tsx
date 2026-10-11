import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ErrorBox, FormField, FormSheet, INPUT_CLASS } from "@/components/FormSheet";
import type { ServiceType } from "@/features/calendar/types";
import { ApiError } from "@/lib/api";
import { DEFAULT_SERVICE_COLOR, getContrastingTextColor } from "@/lib/colors";
import { useSaveServiceType } from "./api";

interface Props {
  open: boolean;
  onClose: () => void;
  serviceType: ServiceType | null;
  existingServiceTypes: ServiceType[];
}

// Sul telefono non c'è il selettore colore del browser: una tavolozza pronta
// più il codice esadecimale, come il campo di testo accanto al selettore web.
const SWATCHES = [
  "#F9A8D4", "#F472B6", "#E11D48", "#EF4444", "#F97316", "#FDE68A",
  "#FACC15", "#84CC16", "#22C55E", "#14B8A6", "#0EA5E9", "#3B82F6",
  "#6366F1", "#7C3AED", "#A855F7", "#78716C", "#CCCCCC", "#1F2937",
];

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// "12,50" → 12.5: sul telefono la tastiera italiana usa la virgola.
function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", "."));
}

export function ServiceTypeForm({ open, onClose, serviceType, existingServiceTypes }: Props) {
  const saveMutation = useSaveServiceType();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [color, setColor] = useState(DEFAULT_SERVICE_COLOR);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(serviceType?.name ?? "");
    setDefaultPrice(serviceType?.defaultPrice ?? "");
    setDurationMinutes(serviceType?.durationMinutes != null ? String(serviceType.durationMinutes) : "");
    setColor(serviceType?.color ?? DEFAULT_SERVICE_COLOR);
  }, [open, serviceType]);

  const duplicateColorName = existingServiceTypes.find(
    (s) => s.id !== serviceType?.id && s.color.toLowerCase() === color.toLowerCase()
  )?.name;

  async function handleSubmit() {
    setError(null);
    const price = parseDecimal(defaultPrice);
    if (!name.trim() || Number.isNaN(price)) {
      setError("Inserisci nome e prezzo della prestazione.");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        id: serviceType?.id,
        data: {
          name: name.trim(),
          defaultPrice: price,
          durationMinutes: durationMinutes.trim() === "" ? null : Number(durationMinutes),
          color,
        },
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore durante il salvataggio. Riprova.");
    }
  }

  const validColor = HEX_COLOR.test(color);

  return (
    <FormSheet
      open={open}
      title={serviceType ? "Modifica prestazione" : "Nuova prestazione"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saveMutation.isPending}
      submitLabel={serviceType ? "Aggiorna" : "Crea"}
    >
      <FormField label="Nome *">
        <TextInput value={name} onChangeText={setName} placeholder="Es. Manicure" className={INPUT_CLASS} />
      </FormField>

      <FormField label="Prezzo (€) *">
        <TextInput
          value={defaultPrice}
          onChangeText={setDefaultPrice}
          keyboardType="decimal-pad"
          placeholder="Es. 25.00"
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Durata (minuti)">
        <TextInput
          value={durationMinutes}
          onChangeText={(v) => setDurationMinutes(v.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder="Es. 30"
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Colore">
        <View className="flex-row flex-wrap gap-2">
          {SWATCHES.map((swatch) => {
            const selected = swatch.toLowerCase() === color.toLowerCase();
            return (
              <Pressable
                key={swatch}
                onPress={() => setColor(swatch)}
                accessibilityRole="radio"
                accessibilityLabel={`Colore ${swatch}`}
                accessibilityState={{ selected }}
                className={`h-9 w-9 items-center justify-center rounded-full border ${selected ? "border-foreground" : "border-border"}`}
                style={{ backgroundColor: swatch }}
              >
                {selected && <Ionicons name="checkmark" size={18} color={getContrastingTextColor(swatch)} />}
              </Pressable>
            );
          })}
        </View>
        <View className="mt-1 flex-row items-center gap-2">
          <View
            className="h-11 w-12 rounded-lg border border-input"
            style={{ backgroundColor: validColor ? color : "transparent" }}
          />
          <TextInput
            value={color}
            onChangeText={setColor}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            placeholder="#CCCCCC"
            accessibilityLabel="Codice colore esadecimale"
            className={`${INPUT_CLASS} flex-1`}
          />
        </View>
        <Text className="text-xs text-muted-foreground">
          Colore identificativo della prestazione, mostrato in calendario.
        </Text>
        {duplicateColorName && (
          <Text className="text-xs text-amber-600 dark:text-amber-400">
            Colore già usato da &quot;{duplicateColorName}&quot;. Puoi salvare comunque, ma sarà meno distinguibile in
            calendario.
          </Text>
        )}
      </FormField>

      <ErrorBox message={error} />
    </FormSheet>
  );
}
