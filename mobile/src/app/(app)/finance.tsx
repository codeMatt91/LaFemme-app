import { AdminOnly } from "@/components/AdminOnly";
import { PlaceholderScreen } from "@/components/PlaceholderScreen";

export default function FinanceScreen() {
  return (
    <AdminOnly>
      <PlaceholderScreen title="Finanze" description="Cruscotto entrate, uscite e spese." />
    </AdminOnly>
  );
}
