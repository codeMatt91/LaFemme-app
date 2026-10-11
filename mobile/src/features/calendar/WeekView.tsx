import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { getContrastingTextColor } from "@/lib/colors";
import type { Appointment } from "./types";

// Come sul web: righe orarie dalle 8:00 alle 20:00.
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const HOUR_COLUMN_WIDTH = 40;

interface Props {
  currentDate: Date;
  appointments: Appointment[];
  getServiceColor: (serviceType: string) => string;
  refreshing: boolean;
  onRefresh: () => void;
  onSlotPress: (date: Date) => void;
  onAppointmentPress: (appointment: Appointment) => void;
}

export function WeekView({
  currentDate,
  appointments,
  getServiceColor,
  refreshing,
  onRefresh,
  onSlotPress,
  onAppointmentPress,
}: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row border-b border-border">
        <Text style={{ width: HOUR_COLUMN_WIDTH }} className="py-2 text-center text-xs text-muted-foreground">
          Ora
        </Text>
        {days.map((d) => (
          <View key={d.toISOString()} className={`flex-1 items-center py-2 ${isToday(d) ? "bg-accent" : ""}`}>
            <Text className="text-xs capitalize text-muted-foreground">{format(d, "EEE", { locale: it })}</Text>
            <Text className={`text-sm font-semibold ${isToday(d) ? "text-primary" : "text-foreground"}`}>
              {format(d, "d")}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {HOURS.map((hour) => (
          <View key={hour} className="min-h-[60px] flex-row border-b border-border">
            <Text
              style={{ width: HOUR_COLUMN_WIDTH }}
              className="border-r border-border px-1 py-1 text-right text-[10px] text-muted-foreground"
            >
              {hour}:00
            </Text>
            {days.map((d) => {
              const slotApts = appointments.filter((a) => {
                const start = new Date(a.startTime);
                return isSameDay(start, d) && start.getHours() === hour;
              });
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => {
                    const date = new Date(d);
                    date.setHours(hour, 0, 0, 0);
                    onSlotPress(date);
                  }}
                  className={`flex-1 gap-0.5 border-r border-border p-px ${isToday(d) ? "bg-accent/50" : ""}`}
                >
                  {slotApts.map((a) => {
                    const bg = getServiceColor(a.serviceType);
                    return (
                      <Pressable
                        key={a.id}
                        onPress={() => onAppointmentPress(a)}
                        className="rounded px-0.5 py-px"
                        style={{ backgroundColor: bg }}
                      >
                        <Text
                          numberOfLines={2}
                          className="text-[9px] font-medium"
                          style={{ color: getContrastingTextColor(bg) }}
                        >
                          {a.customer.lastName} – {a.serviceType}
                        </Text>
                      </Pressable>
                    );
                  })}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
