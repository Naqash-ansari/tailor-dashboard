import { CustomerInvoicePage } from "@/components/CustomerInvoicePage";

export default function InvoicePage({ params }: { params: { id: string } }) {
  return <CustomerInvoicePage customerId={params.id} />;
}
