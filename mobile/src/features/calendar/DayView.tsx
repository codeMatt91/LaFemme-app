import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import {
  DAY_VIEW_END_HOUR,
  DAY_VIEW_START_HOUR,
  FOCUS_Z_INDEX,
  LANE_OFFSET_PX_MOBILE,
  computeDayViewLayout,
  type DayViewBlockLayout,
} from "@/lib/calendarLayout";
import { getContrastingTextColor } from "@/lib/colors";
import { formatCurrency, formatTime } from "@/lib/format";
import type { Appointment } from "./types";

const HOURS = Array.from(
  { length: DAY_VIEW_END_HOUR - DAY_VIEW_START_HOUR },
  (_, i) => i + DAY_VIEW_START_HOUR
);
const HOUR_HEIGHT = 60; // 1px al minuto, come PX_PER_MINUTE
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;
const HOUR_COLUMN_WIDTH = 60;

interface Props {
  currentDate: Date;
  /** Appuntamenti già filtrati su currentDate. */
  appointments: Appointment[];
  getServiceColor: (serviceType: string) => string;
  refreshing: boolean;
  onRefresh: () => void;
  onSlotPress: (date: Date) => void;
  onAppointmentPress: (appointment: Appointment) => void;
}

function maxLines(heightPx: number): number {
  if (heightPx < 40) return 1;
  if (heightPx < 64) return 2;
  return 3;
}

export function DayView({
  currentDate,
  appointments,
  getServiceColor,
  refreshing,
  onRefresh,
  onSlotPress,
  onAppointmentPress,
}: Props) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Il blocco portato in primo piano non resta tale cambiando giorno.
  useEffect(() => {
    setFocusedId(null);
  }, [currentDate]);

  const layouts = useMemo(
    () => computeDayViewLayout(appointments, { laneOffsetPx: LANE_OFFSET_PX_MOBILE }),
    [appointments]
  );
  const appointmentById = useMemo(() => new Map(appointments.map((a) => [a.id, a])), [appointments]);

  // Come sul web: con appuntamenti sovrapposti il primo tocco porta il blocco
  // in primo piano, il secondo (o un tocco sul blocco già davanti) lo apre.
  function handleBlockPress(layout: DayViewBlockLayout) {
    const appointment = appointmentById.get(layout.id);
    if (!appointment) return;
    const isFrontmost =
      focusedId === layout.id || (focusedId === null && layout.clusterIndex === layout.clusterSize - 1);
    if (isFrontmost) onAppointmentPress(appointment);
    else setFocusedId(layout.id);
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ height: GRID_HEIGHT }}>
        {HOURS.map((hour) => (
          <View key={hour} style={{ height: HOUR_HEIGHT }} className="flex-row border-b border-border">
            <Text
              style={{ width: HOUR_COLUMN_WIDTH }}
              className="border-r border-border px-2 py-1 text-right text-[10px] text-muted-foreground"
            >
              {hour}:00
            </Text>
            <Pressable
              className="flex-1"
              accessibilityLabel={`Nuovo appuntamento alle ${hour}:00`}
              onPress={() => {
                setFocusedId(null);
                const date = new Date(currentDate);
                date.setHours(hour, 0, 0, 0);
                onSlotPress(date);
              }}
            />
          </View>
        ))}

        <View
          pointerEvents="box-none"
          style={{ position: "absolute", top: 0, bottom: 0, left: HOUR_COLUMN_WIDTH, right: 0 }}
        >
          {layouts.map((layout) => {
            const appointment = appointmentById.get(layout.id);
            if (!appointment) return null;
            const color = getServiceColor(appointment.serviceType);
            const zIndex = focusedId === layout.id ? FOCUS_Z_INDEX : layout.zIndex;
            return (
              <Pressable
                key={layout.id}
                onPress={() => handleBlockPress(layout)}
                className="rounded-md px-2 py-1"
                style={{
                  position: "absolute",
                  top: layout.top,
                  height: layout.height,
                  left: layout.offsetX,
                  right: 0,
                  zIndex,
                  elevation: zIndex,
                  backgroundColor: color,
                  borderColor: "#FFFFFF",
                  borderWidth: 0.6,
                }}
              >
                <Text
                  numberOfLines={maxLines(layout.height)}
                  className="text-xs font-medium leading-tight"
                  style={{ color: getContrastingTextColor(color) }}
                >
                  {formatTime(appointment.startTime)} {appointment.customer.lastName} – {appointment.serviceType}
                  {appointment.employee &&
                    ` (${appointment.employee.firstName} ${appointment.employee.lastName})`}{" "}
                  · {formatCurrency(appointment.price)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
