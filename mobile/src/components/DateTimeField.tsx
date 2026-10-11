import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  label: string;
  value: Date;
  onChange: (value: Date) => void;
}

// Data + ora. Su iOS usa i selettori compatti nativi; su Android, che non ha
// una modalità data+ora unica, apre in sequenza i dialoghi di data e ora.
export function DateTimeField({ label, value, onChange }: Props) {
  const { scheme } = useTheme();
  if (Platform.OS === "ios") {
    return (
      <View className="gap-1">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        <View className="flex-row items-center gap-2">
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            locale="it-IT"
            themeVariant={scheme}
            onValueChange={(_e, date) => onChange(date)}
          />
          <DateTimePicker
            value={value}
            mode="time"
            display="compact"
            locale="it-IT"
            themeVariant={scheme}
            onValueChange={(_e, date) => onChange(date)}
          />
        </View>
      </View>
    );
  }

  function openAndroid(mode: "date" | "time") {
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: true,
      onValueChange: (_e, date) => onChange(date),
    });
  }

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => openAndroid("date")}
          accessibilityRole="button"
          className="flex-1 rounded-lg border border-input px-3 py-3"
        >
          <Text className="text-foreground">{format(value, "EEE d MMM yyyy", { locale: it })}</Text>
        </Pressable>
        <Pressable
          onPress={() => openAndroid("time")}
          accessibilityRole="button"
          className="rounded-lg border border-input px-3 py-3"
        >
          <Text className="text-foreground">{format(value, "HH:mm")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
