import { AdminOnly } from "@/components/AdminOnly";
import { EmployeesScreen } from "@/features/employees/EmployeesScreen";

export default function EmployeesRoute() {
  return (
    <AdminOnly>
      <EmployeesScreen />
    </AdminOnly>
  );
}
