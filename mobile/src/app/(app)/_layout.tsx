import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Indietro" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="finance" options={{ title: "Finanze" }} />
      <Stack.Screen name="employees" options={{ title: "Dipendenti" }} />
      <Stack.Screen name="settings" options={{ title: "Impostazioni" }} />
    </Stack>
  );
}
