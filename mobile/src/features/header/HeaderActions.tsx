import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { NotificationBell } from "./NotificationBell";
import { ProfileButton } from "./ProfileButton";
import { ThemeToggle } from "./ThemeToggle";

// Lato destro dell'header, come SharedHeader sul web: tema, notifiche, profilo.
export function HeaderActions() {
  return (
    <View className="mr-3 flex-row items-center gap-1">
      <ThemeToggle />
      <NotificationBell />
      <ProfileButton />
    </View>
  );
}

// Lato sinistro dell'header (come sul web da telefono): esci, con conferma.
export function LogoutButton() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  function confirm() {
    Alert.alert("Esci dall'account?", "Dovrai effettuare nuovamente l'accesso per continuare.", [
      { text: "Annulla", style: "cancel" },
      { text: "Esci", style: "destructive", onPress: () => void signOut() },
    ]);
  }

  return (
    <Pressable onPress={confirm} accessibilityRole="button" accessibilityLabel="Esci" hitSlop={6} className="ml-3 p-1.5">
      <Ionicons name="log-out-outline" size={22} color={colors.foreground} />
    </Pressable>
  );
}
