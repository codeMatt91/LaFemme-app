import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { ApiError } from "@/lib/api";
import { CustomerCard } from "./CustomerCard";
import { CustomerForm } from "./CustomerForm";
import { useCustomers, useDeleteCustomer } from "./api";
import type { Customer } from "./types";
import { useTheme } from "@/theme/ThemeProvider";

export function CustomersScreen() {
  const { colors } = useTheme();
  const customersQuery = useCustomers();
  const deleteMutation = useDeleteCustomer();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const customers = customersQuery.data ?? [];

  // Stessi campi di ricerca della tabella web: nome, cognome, telefono, email.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phoneNumber?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  function openCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function confirmDelete(customer: Customer) {
    const name = `${customer.firstName} ${customer.lastName}`;
    Alert.alert("Elimina cliente", `Eliminare ${name}? Tutti gli appuntamenti associati saranno eliminati.`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(customer.id, {
            onError: (e) =>
              Alert.alert("Errore", e instanceof ApiError ? e.message : "Errore durante l'eliminazione. Riprova."),
          }),
      },
    ]);
  }

  const header = (
    <View className="gap-3 pb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <View>
            <Text className="font-semibold text-foreground">Anagrafica Clienti</Text>
            <Text className="text-sm text-muted-foreground">{customers.length} clienti registrati</Text>
          </View>
        </View>
        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-lg bg-primary px-3 py-2"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-sm font-medium text-primary-foreground">Nuovo cliente</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center rounded-lg border border-input px-3">
        <Ionicons name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cerca per nome o telefono..."
          autoCorrect={false}
          clearButtonMode="while-editing"
          className="flex-1 px-2 py-2.5 text-foreground"
        />
      </View>

      {customersQuery.isError && (
        <Pressable onPress={() => customersQuery.refetch()} className="rounded-lg bg-destructive/10 px-3 py-2">
          <Text className="text-sm text-destructive">{customersQuery.error.message} Tocca per riprovare.</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerClassName="p-4 gap-2"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={
          customersQuery.isLoading ? (
            <ActivityIndicator className="py-8" />
          ) : (
            <Text className="py-8 text-center text-sm text-muted-foreground">Nessun cliente trovato</Text>
          )
        }
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            deleting={deleteMutation.isPending && deleteMutation.variables === item.id}
            onEdit={() => openEdit(item)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={customersQuery.isRefetching}
            onRefresh={() => customersQuery.refetch()}
          />
        }
      />

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} customer={editingCustomer} />
    </View>
  );
}
