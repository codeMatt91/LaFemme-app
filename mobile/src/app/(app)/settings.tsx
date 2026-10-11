import { AdminOnly } from "@/components/AdminOnly";
import { SettingsScreen } from "@/features/settings/SettingsScreen";

export default function SettingsRoute() {
  return (
    <AdminOnly>
      <SettingsScreen />
    </AdminOnly>
  );
}
