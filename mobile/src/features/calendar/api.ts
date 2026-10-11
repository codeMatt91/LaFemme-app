import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { api } from "@/lib/api";
import type { Appointment, AppointmentInput, Person, ServiceType, ViewMode } from "./types";

// Stesso intervallo caricato da CalendarClient sul web per ogni vista.
export function getRange(date: Date, view: ViewMode): { from: Date; to: Date } {
  if (view === "month") return { from: startOfMonth(date), to: endOfMonth(date) };
  if (view === "week") {
    return { from: startOfWeek(date, { weekStartsOn: 1 }), to: endOfWeek(date, { weekStartsOn: 1 }) };
  }
  return { from: startOfDay(date), to: endOfDay(date) };
}

export function shiftDate(date: Date, view: ViewMode, dir: 1 | -1): Date {
  if (view === "month") return addMonths(date, dir);
  if (view === "week") return addWeeks(date, dir);
  return addDays(date, dir);
}

const APPOINTMENTS_KEY = "appointments";

export function useAppointments(date: Date, view: ViewMode) {
  const { from, to } = getRange(date, view);
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, fromIso, toIso],
    queryFn: () =>
      api<{ appointments: Appointment[] }>(
        `/appointments?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`
      ).then((r) => r.appointments),
    // Mentre si cambia periodo resta visibile quello precedente, come sul web.
    placeholderData: (previous) => previous,
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => api<{ employees: Person[] }>("/employees").then((r) => r.employees),
  });
}

export function useServiceTypes() {
  return useQuery({
    queryKey: ["serviceTypes"],
    queryFn: () => api<{ serviceTypes: ServiceType[] }>("/service-types").then((r) => r.serviceTypes),
  });
}

export function useSaveAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: AppointmentInput }) =>
      id
        ? api(`/appointments/${id}`, { method: "PATCH", body: data })
        : api("/appointments", { method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });
}
