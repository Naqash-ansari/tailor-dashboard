import { CustomerPrintPage } from "@/components/CustomerPrintPage";

export default function PrintPage({ params }: { params: { id: string } }) {
  return <CustomerPrintPage customerId={params.id} />;
}
