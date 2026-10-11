import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { ErrorBox } from "@/components/FormSheet";
import { ApiError } from "@/lib/api";
import { UserCard } from "./UserCard";
import { UserForm } from "./UserForm";
import { useDeleteUser, useUsers } from "./api";
import type { UserRecord } from "./types";
import { useTheme } from "@/theme/ThemeProvider";

// Come la pagina Dipendenti web: elenco degli account con crea / modifica / elimina.
export function EmployeesScreen() {
  const { colors } = useTheme();
  const usersQuery = useUsers();
  const deleteMutation = useDeleteUser();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const users = usersQuery.data ?? [];

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: UserRecord) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function confirmDelete(user: UserRecord) {
    const name = `${user.firstName} ${user.lastName}`;
    Alert.alert("Elimina utente", `Eliminare l'account di ${name}?`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          setDeleteError(null);
          deleteMutation.mutate(user.id, {
            onError: (e) =>
              setDeleteError(e instanceof ApiError ? e.message : "Errore durante l'eliminazione. Riprova."),
          });
        },
      },
    ]);
  }

  const header = (
    <View className="gap-3 pb-3">
      <ErrorBox message={deleteError} />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
          <View>
            <Text className="font-semibold text-foreground">Utenti del sistema</Text>
            <Text className="text-sm text-muted-foreground">{users.length} account</Text>
          </View>
        </View>
        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-lg bg-primary px-3 py-2"
        >
          <Ionicons name="add" size={16} color={colors.primaryForeground} />
          <Text className="text-sm font-medium text-primary-foreground">Nuovo utente</Text>
        </Pressable>
      </View>

      {usersQuery.isError && (
        <Pressable onPress={() => usersQuery.refetch()} className="rounded-lg bg-destructive/10 px-3 py-2">
          <Text className="text-sm text-destructive">{usersQuery.error.message} Tocca per riprovare.</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerClassName="p-4 gap-2"
        ListHeaderComponent={header}
        ListEmptyComponent={usersQuery.isLoading ? <ActivityIndicator className="py-8" /> : null}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            deleting={deleteMutation.isPending && deleteMutation.variables === item.id}
            onEdit={() => openEdit(item)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={usersQuery.isRefetching} onRefresh={() => usersQuery.refetch()} />
        }
      />

      <UserForm open={formOpen} onClose={() => setFormOpen(false)} user={editingUser} />
    </View>
  );
}
