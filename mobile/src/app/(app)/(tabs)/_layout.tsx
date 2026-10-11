import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

// Rosa del brand (primary in tailwind.config.js).
const ACTIVE_TINT = "hsl(346, 77%, 49%)";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: ACTIVE_TINT }}>
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
