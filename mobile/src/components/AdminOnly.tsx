import { Redirect } from "expo-router";
import { useCurrentUser } from "@/auth/AuthProvider";

// Come il middleware web: le sezioni admin rimandano gli altri al calendario.
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  if (user.role !== "ADMIN") return <Redirect href="/calendar" />;
  return <>{children}</>;
}
