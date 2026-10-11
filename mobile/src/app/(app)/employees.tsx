import { AdminOnly } from "@/components/AdminOnly";
import { PlaceholderScreen } from "@/components/PlaceholderScreen";

export default function EmployeesScreen() {
  return (
    <AdminOnly>
      <PlaceholderScreen title="Dipendenti" description="Gestione degli account del personale." />
    </AdminOnly>
  );
}
