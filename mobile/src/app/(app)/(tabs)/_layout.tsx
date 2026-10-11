import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { HeaderActions, LogoutButton } from "@/features/header/HeaderActions";
import { useTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerLeft: () => <LogoutButton />,
        headerRight: () => <HeaderActions />,
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Clienti",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Altro",
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
