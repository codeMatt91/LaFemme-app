import { Redirect } from "expo-router";

// Come sul web, "/" porta al calendario.
export default function Index() {
  return <Redirect href="/calendar" />;
}
