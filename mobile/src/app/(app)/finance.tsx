import { AdminOnly } from "@/components/AdminOnly";
import { FinanceScreen } from "@/features/finance/FinanceScreen";

export default function FinanceRoute() {
  return (
    <AdminOnly>
      <FinanceScreen />
    </AdminOnly>
  );
}
