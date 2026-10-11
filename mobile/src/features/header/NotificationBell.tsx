import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { HeaderPanel } from "./HeaderPanel";
import { useHasUnreadNotifications, useNotifications } from "./api";

function NotificationList() {
  const { colors } = useTheme();
  const { data: notifications, isLoading, isError } = useNotifications(true);

  if (isLoading) {
    return (
      <View className="gap-3 p-4">
        {[0, 1, 2].map((i) => (
          <View key={i} className="h-10 rounded-lg bg-secondary" />
        ))}
      </View>
    );
  }
  if (isError) {
    return <Text className="p-6 text-center text-sm text-destructive">Impossibile caricare le notifiche.</Text>;
  }
  if (!notifications || notifications.length === 0) {
    return <Text className="p-6 text-center text-sm text-muted-foreground">Nessuna notifica</Text>;
  }
  return (
    <ScrollView>
      {notifications.map((n, i) => (
        <View
          key={n.id}
          className={`flex-row items-start gap-3 px-4 py-3 ${i < notifications.length - 1 ? "border-b border-border" : ""}`}
        >
          <Ionicons
            name={n.success ? "checkmark-circle-outline" : "close-circle-outline"}
            size={16}
            color={n.success ? colors.success : colors.destructive}
            style={{ marginTop: 2 }}
          />
          <View className="flex-1">
            <Text numberOfLines={1} className="text-sm font-medium text-foreground">
              {n.customerName} – {n.appointmentType}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {n.success ? "Email inviata" : (n.errorMessage ?? "Invio fallito")}
              {" · "}
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: it })}
            </Text>
          </View>
          {!n.read && (
            <View accessibilityLabel="Non letta" className="mt-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

export function NotificationBell() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const { data: hasUnread } = useHasUnreadNotifications();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Notifiche"
        accessibilityState={{ expanded: open }}
        hitSlop={6}
        className="relative p-2"
      >
        <Ionicons name="notifications-outline" size={20} color={colors.mutedForeground} />
        {hasUnread && <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />}
      </Pressable>

      <HeaderPanel open={open} onClose={() => setOpen(false)}>
        <View className="border-b border-border p-4">
          <Text className="text-sm font-semibold text-foreground">Notifiche</Text>
        </View>
        {open && <NotificationList />}
      </HeaderPanel>
    </>
  );
}
