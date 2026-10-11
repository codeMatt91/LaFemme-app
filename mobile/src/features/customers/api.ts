import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Customer, CustomerInput } from "./types";

const CUSTOMERS_KEY = ["customers"];

// Usato dalla scheda Clienti e dal selettore cliente del calendario.
export function useCustomers(enabled = true) {
  return useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: () => api<{ customers: Customer[] }>("/customers").then((r) => r.customers),
    enabled,
  });
}

export function useSaveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: CustomerInput }) =>
      id
        ? api(`/customers/${id}`, { method: "PATCH", body: data })
        : api("/customers", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      // Il calendario mostra il cognome del cliente sugli appuntamenti.
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      // Eliminando un cliente si eliminano anche i suoi appuntamenti.
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
