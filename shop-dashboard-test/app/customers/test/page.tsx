import { Suspense } from "react";
import { CustomerTestForm } from "@/components/CustomerTestForm";

export default function CustomerTestPage() {
    return (
        <Suspense fallback={null}>
            <CustomerTestForm />
        </Suspense>
    );
}
