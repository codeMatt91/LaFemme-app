import { Stack } from "expo-router";
import { HeaderActions } from "@/features/header/HeaderActions";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Indietro", headerRight: () => <HeaderActions /> }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="finance" options={{ title: "Dashboard Finanziaria" }} />
      <Stack.Screen name="employees" options={{ title: "Gestione Dipendenti" }} />
      <Stack.Screen name="settings" options={{ title: "Impostazioni" }} />
    </Stack>
  );
}
