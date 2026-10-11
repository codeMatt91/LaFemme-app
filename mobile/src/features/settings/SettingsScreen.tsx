import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useServiceTypes } from "@/features/calendar/api";
import type { ServiceType } from "@/features/calendar/types";
import { ApiError } from "@/lib/api";
import { ServiceTypeCard } from "./ServiceTypeCard";
import { ServiceTypeForm } from "./ServiceTypeForm";
import { useDeleteServiceType } from "./api";
import { useTheme } from "@/theme/ThemeProvider";

// Come la pagina Impostazioni web su schermo piccolo: tipologie di prestazioni.
// La pulizia/archiviazione dati sul web è solo da computer (scarica uno ZIP),
// quindi qui non c'è.
export function SettingsScreen() {
  const { colors } = useTheme();
  const serviceTypesQuery = useServiceTypes();
  const deleteMutation = useDeleteServiceType();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceType | null>(null);

  const serviceTypes = serviceTypesQuery.data ?? [];
  const filtered = useMemo(
    () => serviceTypes.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [serviceTypes, search]
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(s: ServiceType) {
    setEditing(s);
    setFormOpen(true);
  }

  function confirmDelete(s: ServiceType) {
    Alert.alert(
      "Elimina prestazione",
      `Eliminare la prestazione "${s.name}"? Gli appuntamenti esistenti non verranno modificati.`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: () =>
            deleteMutation.mutate(s.id, {
              onError: (e) =>
                Alert.alert("Errore", e instanceof ApiError ? e.message : "Errore durante l'eliminazione. Riprova."),
            }),
        },
      ]
    );
  }

  const emptyMessage = serviceTypes.length === 0 ? "Nessuna prestazione configurata" : "Nessuna prestazione trovata";

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={serviceTypesQuery.isRefetching} onRefresh={() => serviceTypesQuery.refetch()} />
        }
      >
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          <View className="flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
            <View className="flex-1 flex-row items-center gap-3">
              <Ionicons name="cut-outline" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Tipologie di Prestazioni</Text>
                <Text className="text-sm text-muted-foreground">
                  Gestisci i servizi disponibili per gli appuntamenti
                </Text>
              </View>
            </View>
            <Pressable
              onPress={openCreate}
              accessibilityRole="button"
              accessibilityLabel="Nuova prestazione"
              className="rounded-lg bg-primary px-3 py-2"
            >
              <Ionicons name="add" size={18} color={colors.primaryForeground} />
            </Pressable>
          </View>

          <View className="gap-3 p-5">
            <View className="flex-row items-center rounded-lg border border-input px-3">
              <Ionicons name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cerca prestazione..."
                placeholderTextColor={colors.mutedForeground}
                autoCorrect={false}
                clearButtonMode="while-editing"
                className="flex-1 px-2 py-2.5 text-foreground"
              />
            </View>

            {serviceTypesQuery.isError && (
              <Pressable onPress={() => serviceTypesQuery.refetch()} className="rounded-lg bg-destructive/10 px-3 py-2">
                <Text className="text-sm text-destructive">
                  {serviceTypesQuery.error.message} Tocca per riprovare.
                </Text>
              </Pressable>
            )}

            {serviceTypesQuery.isLoading ? (
              <ActivityIndicator className="py-8" />
            ) : filtered.length === 0 ? (
              <Text className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</Text>
            ) : (
              <View className="gap-2">
                {filtered.map((s) => (
                  <ServiceTypeCard
                    key={s.id}
                    serviceType={s}
                    deleting={deleteMutation.isPending && deleteMutation.variables === s.id}
                    onEdit={() => openEdit(s)}
                    onDelete={() => confirmDelete(s)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ServiceTypeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        serviceType={editing}
        existingServiceTypes={serviceTypes}
      />
    </View>
  );
}
