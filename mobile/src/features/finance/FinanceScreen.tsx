import Ionicons from "@expo/vector-icons/Ionicons";
import { endOfMonth, endOfYear, startOfMonth, startOfYear } from "date-fns";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { DateField } from "@/components/DateField";
import { SelectField } from "@/components/SelectField";
import { useServiceTypes } from "@/features/calendar/api";
import { ApiError } from "@/lib/api";
import { toDateOnlyString } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { AddExpenseForm } from "./AddExpenseForm";
import { ExpensesCard } from "./ExpensesCard";
import { FinancialChart } from "./FinancialChart";
import { StatCard } from "./StatCard";
import { useDeleteExpense, useFinance } from "./api";
import { exportFinanceReport } from "./exportReport";
import { ALL_SERVICES, buildChartData, totals } from "./logic";
import type { ReportPeriod } from "./report";
import type { ExpenseRecord, Granularity } from "./types";

const GRANULARITY_LABEL: Record<Granularity, string> = {
  day: "Giornaliero",
  month: "Mensile",
  year: "Annuale",
};

const EMPTY_SUMMARY = { appointments: [], expenses: [] };

// Come la Dashboard Finanziaria web: filtri, KPI, grafico Entrate vs Uscite,
// spese del periodo ed export PDF.
export function FinanceScreen() {
  const { colors } = useTheme();
  const [dateFrom, setDateFrom] = useState(() => toDateOnlyString(startOfMonth(new Date())));
  const [dateTo, setDateTo] = useState(() => toDateOnlyString(endOfMonth(new Date())));
  const [serviceFilter, setServiceFilter] = useState(ALL_SERVICES);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [exporting, setExporting] = useState<ReportPeriod | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const financeQuery = useFinance(dateFrom, dateTo);
  const serviceTypesQuery = useServiceTypes();
  const deleteMutation = useDeleteExpense();

  const summary = financeQuery.data?.summary ?? EMPTY_SUMMARY;
  const expenses = financeQuery.data?.expenses ?? [];
  const chartData = useMemo(
    () => buildChartData(summary, dateFrom, dateTo, serviceFilter, granularity),
    [summary, dateFrom, dateTo, serviceFilter, granularity]
  );
  const kpi = totals(chartData);

  const serviceItems = useMemo(
    () => [ALL_SERVICES, ...(serviceTypesQuery.data ?? []).map((s) => s.name)].map((s) => ({ value: s, label: s })),
    [serviceTypesQuery.data]
  );

  function selectGranularity(next: Granularity) {
    setGranularity(next);
    // Come sul web: Giornaliero riporta al mese corrente, Annuale all'anno corrente,
    // Mensile tiene il periodo scelto.
    const now = new Date();
    if (next === "day") {
      setDateFrom(toDateOnlyString(startOfMonth(now)));
      setDateTo(toDateOnlyString(endOfMonth(now)));
    } else if (next === "year") {
      setDateFrom(toDateOnlyString(startOfYear(now)));
      setDateTo(toDateOnlyString(endOfYear(now)));
    }
  }

  async function handleExport(period: ReportPeriod) {
    setExportError(null);
    setExporting(period);
    try {
      await exportFinanceReport(period);
    } catch (e) {
      // Errori del server (es. sessione scaduta) col loro messaggio; quelli del
      // telefono (stampa, condivisione) con un messaggio generico.
      setExportError(e instanceof ApiError ? e.message : "Errore durante l'export. Riprova.");
    } finally {
      setExporting(null);
    }
  }

  function confirmDelete(expense: ExpenseRecord) {
    Alert.alert("Elimina spesa", "Eliminare questa spesa?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(expense.id, {
            onError: (e) =>
              Alert.alert("Errore", e instanceof ApiError ? e.message : "Errore durante l'eliminazione. Riprova."),
          }),
      },
    ]);
  }

  const loadingChart = financeQuery.isLoading || financeQuery.isPlaceholderData;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-5 p-4"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={financeQuery.isRefetching && !financeQuery.isPlaceholderData}
            onRefresh={() => financeQuery.refetch()}
          />
        }
      >
        {/* ── Filtri ── */}
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="funnel-outline" size={16} color={colors.mutedForeground} />
            <Text className="text-sm font-medium text-muted-foreground">Filtri</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <DateField label="Dal" value={dateFrom} onChange={(v) => v && setDateFrom(v)} required />
            </View>
            <View className="flex-1">
              <DateField label="Al" value={dateTo} onChange={(v) => v && setDateTo(v)} required />
            </View>
          </View>
          {dateTo < dateFrom && (
            <Text className="text-xs text-destructive">La data finale è precedente a quella iniziale.</Text>
          )}

          <SelectField
            label="Servizio"
            items={serviceItems}
            value={serviceFilter}
            onChange={setServiceFilter}
            placeholder={ALL_SERVICES}
          />

          <View className="flex-row overflow-hidden rounded-lg border border-border">
            {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => {
              const selected = granularity === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => selectGranularity(g)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`flex-1 items-center py-2 ${selected ? "bg-primary" : ""}`}
                >
                  <Text className={`text-sm font-medium ${selected ? "text-primary-foreground" : "text-foreground"}`}>
                    {GRANULARITY_LABEL[g]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-2">
            {(["month", "year"] as const).map((period) => (
              <Pressable
                key={period}
                onPress={() => handleExport(period)}
                disabled={exporting !== null}
                accessibilityRole="button"
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-border py-2 disabled:opacity-50"
              >
                {exporting === period ? (
                  <ActivityIndicator size="small" color={colors.foreground} />
                ) : (
                  <Ionicons name="download-outline" size={14} color={colors.foreground} />
                )}
                <Text className="text-sm text-foreground">{period === "month" ? "Esporta mese" : "Esporta anno"}</Text>
              </Pressable>
            ))}
          </View>

          {exportError !== null && (
            <View className="flex-row items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
              <Text className="flex-1 text-sm text-destructive">{exportError}</Text>
              <Pressable onPress={() => setExportError(null)} accessibilityLabel="Chiudi errore" hitSlop={8}>
                <Ionicons name="close" size={14} color={colors.destructive} />
              </Pressable>
            </View>
          )}
        </View>

        {financeQuery.isError && (
          <Pressable onPress={() => financeQuery.refetch()} className="rounded-lg bg-destructive/10 px-3 py-2">
            <Text className="text-sm text-destructive">{financeQuery.error.message} Tocca per riprovare.</Text>
          </Pressable>
        )}

        {/* ── KPI ── */}
        <View className="gap-4">
          <StatCard label="Entrate totali" value={formatCurrency(kpi.entrate)} icon="trending-up" trend="up" />
          <StatCard label="Uscite totali" value={formatCurrency(kpi.uscite)} icon="trending-down" trend="down" />
          <StatCard
            label="Profitto netto"
            value={formatCurrency(kpi.profitto)}
            icon="cash-outline"
            trend={kpi.profitto >= 0 ? "up" : "down"}
          />
        </View>

        {/* ── Grafico ── */}
        <View className="rounded-xl border border-border bg-card p-4">
          <Text className="mb-4 font-semibold text-foreground">
            Entrate vs Uscite{" "}
            <Text className="text-sm font-normal text-muted-foreground">
              ({GRANULARITY_LABEL[granularity].toLowerCase()})
            </Text>
          </Text>
          {loadingChart ? (
            <View className="h-64 items-center justify-center">
              <Text className="text-sm text-muted-foreground">Caricamento...</Text>
            </View>
          ) : (
            <FinancialChart data={chartData} />
          )}
        </View>

        {/* ── Spese ── */}
        <ExpensesCard
          expenses={expenses}
          deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
          onAdd={() => setAddExpenseOpen(true)}
          onDelete={confirmDelete}
        />
      </ScrollView>

      <AddExpenseForm open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
    </View>
  );
}
