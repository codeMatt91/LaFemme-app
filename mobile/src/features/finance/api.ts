import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toRange } from "./logic";
import type { ExpenseInput, FinanceData } from "./types";

const FINANCE_KEY = "finance";

export function fetchFinance(from: string, to: string) {
  return api<FinanceData>(`/finance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

/** Entrate e spese del periodo scelto nei filtri ("YYYY-MM-DD"). */
export function useFinance(dateFrom: string, dateTo: string) {
  const { from, to } = toRange(dateFrom, dateTo);
  return useQuery({
    queryKey: [FINANCE_KEY, from, to],
    queryFn: () => fetchFinance(from, to),
    enabled: dateTo >= dateFrom,
    // Mentre si cambia periodo resta visibile quello precedente, come sul web.
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseInput) => api("/expenses", { method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FINANCE_KEY] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FINANCE_KEY] }),
  });
}
