import { Suspense } from "react";
import { CustomerOrderForm } from "@/components/CustomerOrderForm";

export default function CustomerOrderPage() {
    return (
        <Suspense fallback={null}>
            <CustomerOrderForm />
        </Suspense>
    );
}
