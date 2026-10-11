import { AdminOnly } from "@/components/AdminOnly";
import { PlaceholderScreen } from "@/components/PlaceholderScreen";

export default function SettingsScreen() {
  return (
    <AdminOnly>
      <PlaceholderScreen title="Impostazioni" description="Tipologie di prestazioni e archiviazione dati." />
    </AdminOnly>
  );
}
