import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// L'elenco arriva da useServiceTypes() del calendario (stessa chiave "serviceTypes"),
// così legenda e modulo appuntamento si aggiornano insieme alle Impostazioni.
const SERVICE_TYPES_KEY = ["serviceTypes"];

export interface ServiceTypeInput {
  name: string;
  defaultPrice: number;
  durationMinutes: number | null;
  color: string;
}

export function useSaveServiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: ServiceTypeInput }) =>
      id
        ? api(`/service-types/${id}`, { method: "PATCH", body: data })
        : api("/service-types", { method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICE_TYPES_KEY }),
  });
}

export function useDeleteServiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/service-types/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICE_TYPES_KEY }),
  });
}
