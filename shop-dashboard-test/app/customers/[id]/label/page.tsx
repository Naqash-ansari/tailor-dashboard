import { CustomerLabelPage } from "@/components/CustomerLabelPage";

export default function LabelPage({ params }: { params: { id: string } }) {
  return <CustomerLabelPage customerId={params.id} />;
}
