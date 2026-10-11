import { isSameDay } from "date-fns";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { DEFAULT_SERVICE_COLOR } from "@/lib/colors";
import { AppointmentModal } from "./AppointmentModal";
import { CalendarToolbar } from "./CalendarToolbar";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { ServiceLegend } from "./ServiceLegend";
import { WeekView } from "./WeekView";
import { shiftDate, useAppointments, useEmployees, useServiceTypes } from "./api";
import type { Appointment, ViewMode } from "./types";

export function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const appointmentsQuery = useAppointments(currentDate, view);
  const employeesQuery = useEmployees();
  const serviceTypesQuery = useServiceTypes();

  const appointments = appointmentsQuery.data ?? [];
  const serviceTypes = serviceTypesQuery.data ?? [];

  const getServiceColor = useCallback(
    (name: string) => serviceTypes.find((s) => s.name === name)?.color ?? DEFAULT_SERVICE_COLOR,
    [serviceTypes]
  );

  function openNew(date: Date) {
    setSelectedAppointment(null);
    setSelectedDate(date);
    setModalOpen(true);
  }

  function openEdit(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setSelectedDate(undefined);
    setModalOpen(true);
  }

  function refresh() {
    appointmentsQuery.refetch();
    serviceTypesQuery.refetch();
    employeesQuery.refetch();
  }

  const viewProps = {
    currentDate,
    getServiceColor,
    refreshing: appointmentsQuery.isRefetching && !appointmentsQuery.isPlaceholderData,
    onRefresh: refresh,
    onAppointmentPress: openEdit,
  };

  return (
    <View className="flex-1 bg-background">
      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        isFetching={appointmentsQuery.isFetching}
        onNavigate={(dir) => setCurrentDate((d) => shiftDate(d, view, dir))}
        onViewChange={setView}
        onGoToToday={() => setCurrentDate(new Date())}
        onNew={() => openNew(new Date())}
      />
      <ServiceLegend serviceTypes={serviceTypes} />

      {appointmentsQuery.isError && (
        <Pressable onPress={refresh} className="bg-destructive/10 px-4 py-2">
          <Text className="text-sm text-destructive">
            {appointmentsQuery.error.message} Tocca per riprovare.
          </Text>
        </Pressable>
      )}

      {view === "month" ? (
        <MonthView {...viewProps} appointments={appointments} onDayPress={openNew} />
      ) : view === "week" ? (
        <WeekView {...viewProps} appointments={appointments} onSlotPress={openNew} />
      ) : (
        <DayView
          {...viewProps}
          appointments={appointments.filter((a) => isSameDay(new Date(a.startTime), currentDate))}
          onSlotPress={openNew}
        />
      )}

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointment={selectedAppointment}
        defaultDate={selectedDate}
        employees={employeesQuery.data ?? []}
        serviceTypes={serviceTypes}
      />
    </View>
  );
}
