import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function RootNavigator() {
  const { state } = useAuth();
  const { scheme } = useTheme();

  if (state.status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  // Le route protette sono raggiungibili solo con la guardia attiva:
  // senza sessione si finisce sempre su /login, e viceversa.
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={state.status === "signedIn"}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={state.status === "signedOut"}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
