import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth, useCurrentUser } from "@/auth/AuthProvider";

const ADMIN_LINKS: { href: Href; label: string }[] = [
  { href: "/finance", label: "Finanze" },
  { href: "/employees", label: "Dipendenti" },
  { href: "/settings", label: "Impostazioni" },
];

export default function MoreScreen() {
  const user = useCurrentUser();
  const { signOut } = useAuth();

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      <View className="mb-6 rounded-lg bg-accent p-4">
        <Text className="text-lg font-semibold text-accent-foreground">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-muted-foreground">{user.email}</Text>
        <Text className="mt-1 text-xs uppercase text-muted-foreground">
          {user.role === "ADMIN" ? "Amministratore" : "Dipendente"}
        </Text>
      </View>

      {user.role === "ADMIN" &&
        ADMIN_LINKS.map((link) => (
          <Link key={link.label} href={link.href} asChild>
            <Pressable className="mb-2 rounded-lg border border-border px-4 py-4">
              <Text className="text-foreground">{link.label}</Text>
            </Pressable>
          </Link>
        ))}

      <Pressable
        onPress={signOut}
        accessibilityRole="button"
        className="mt-4 items-center rounded-lg border border-destructive py-3"
      >
        <Text className="font-semibold text-destructive">Esci</Text>
      </Pressable>
    </ScrollView>
  );
}
