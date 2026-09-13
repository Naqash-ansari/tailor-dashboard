import { Suspense } from "react";
import { CustomersTable } from "@/components/CustomersTable";

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersTable />
    </Suspense>
  );
}
