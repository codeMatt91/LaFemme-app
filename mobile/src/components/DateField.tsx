import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform, Pressable, Text, View } from "react-native";
import { formatDateOnly, parseDateOnly, toDateOnlyString } from "@/lib/dates";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  label: string;
  /** "YYYY-MM-DD" o null se non impostata. */
  value: string | null;
  onChange: (value: string | null) => void;
  maximumDate?: Date;
  /** Data proposta quando il campo è vuoto. */
  initialDate?: Date;
  /** Campo obbligatorio: nasconde "Rimuovi". */
  required?: boolean;
}

// Campo data: se facoltativo si può anche rimuovere.
export function DateField({ label, value, onChange, maximumDate, initialDate = new Date(), required = false }: Props) {
  const { scheme } = useTheme();
  const current = value ? parseDateOnly(value) : initialDate;

  function openAndroid() {
    DateTimePickerAndroid.open({
      value: current,
      mode: "date",
      maximumDate,
      onValueChange: (_e, date) => onChange(toDateOnlyString(date)),
    });
  }

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">
        {Platform.OS === "ios" && value ? (
          <DateTimePicker
            value={current}
            mode="date"
            display="compact"
            locale="it-IT"
            themeVariant={scheme}
            maximumDate={maximumDate}
            onValueChange={(_e, date) => onChange(toDateOnlyString(date))}
          />
        ) : (
          <Pressable
            onPress={() => (Platform.OS === "ios" ? onChange(toDateOnlyString(current)) : openAndroid())}
            accessibilityRole="button"
            accessibilityLabel={label}
            className="flex-1 rounded-lg border border-input px-3 py-3"
          >
            <Text className={value ? "text-foreground" : "text-muted-foreground"}>
              {value ? formatDateOnly(value) : "Seleziona data"}
            </Text>
          </Pressable>
        )}
        {value && !required && (
          <Pressable onPress={() => onChange(null)} accessibilityRole="button" hitSlop={8} className="px-2 py-2">
            <Text className="text-sm text-muted-foreground">Rimuovi</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
