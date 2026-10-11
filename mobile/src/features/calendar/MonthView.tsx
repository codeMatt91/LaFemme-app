import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { getContrastingTextColor } from "@/lib/colors";
import { formatTime } from "@/lib/format";
import type { Appointment } from "./types";

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MAX_VISIBLE = 3;

interface Props {
  currentDate: Date;
  appointments: Appointment[];
  getServiceColor: (serviceType: string) => string;
  refreshing: boolean;
  onRefresh: () => void;
  onDayPress: (date: Date) => void;
  onAppointmentPress: (appointment: Appointment) => void;
}

export function MonthView({
  currentDate,
  appointments,
  getServiceColor,
  refreshing,
  onRefresh,
  onDayPress,
  onAppointmentPress,
}: Props) {
  const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const weeks: Date[][] = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(day, i)));
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row border-b border-border">
        {WEEK_DAYS.map((d) => (
          <Text key={d} className="flex-1 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0].toISOString()} className="flex-row">
          {week.map((day) => {
            const dayApts = appointments.filter((a) => isSameDay(new Date(a.startTime), day));
            const today = isToday(day);
            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => onDayPress(day)}
                accessibilityLabel={`Nuovo appuntamento il ${format(day, "d/M")}`}
                className={`min-h-[96px] flex-1 border-b border-r border-border p-0.5 ${
                  isSameMonth(day, currentDate) ? "" : "opacity-40"
                } ${today ? "bg-accent" : ""}`}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${today ? "bg-primary" : ""}`}
                >
                  <Text
                    className={`text-xs font-medium ${today ? "text-primary-foreground" : "text-foreground"}`}
                  >
                    {format(day, "d")}
                  </Text>
                </View>
                <View className="mt-0.5 gap-0.5">
                  {dayApts.slice(0, MAX_VISIBLE).map((a) => {
                    const bg = getServiceColor(a.serviceType);
                    return (
                      <Pressable
                        key={a.id}
                        onPress={() => onAppointmentPress(a)}
                        hitSlop={2}
                        className="rounded px-0.5 py-px"
                        style={{ backgroundColor: bg }}
                      >
                        <Text
                          numberOfLines={1}
                          className="text-[9px] font-medium"
                          style={{ color: getContrastingTextColor(bg) }}
                        >
                          {formatTime(a.startTime)} {a.customer.lastName}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {dayApts.length > MAX_VISIBLE && (
                    <Text className="px-0.5 text-[9px] text-muted-foreground">
                      +{dayApts.length - MAX_VISIBLE} altri
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
