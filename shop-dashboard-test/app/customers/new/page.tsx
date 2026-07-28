import { Suspense } from "react";
import { CustomerForm } from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <Suspense fallback={null}>
      <CustomerForm />
    </Suspense>
  );
}
