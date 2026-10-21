"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ShopBrandText } from "@/components/ShopBrandText";
import { fetchCustomer } from "@/lib/customerApi";
import { formatDisplayDate } from "@/lib/formatDate";
import type { TailorCustomer } from "@/types/customer";

function parseAmount(value: string) {
  return Number((value || "").replace(/[^0-9.]/g, "")) || 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function money(value: number) {
  return `£${formatAmount(value)}`;
}

// Orders saved before invoice numbers existed fall back to the old id-based number.
function invoiceNumber(customer: TailorCustomer) {
  return (
    customer.invoiceNumber ||
    `INV-${customer.createdAt.slice(0, 4)}-${customer.id.slice(0, 8).toUpperCase()}`
  );
}

// Items added on the invoice page only (not saved), for one-off extras at print time.
type ExtraItem = {
  id: string;
  description: string;
  qty: string;
  rate: string;
};

function createExtraItem(): ExtraItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    qty: "1",
    rate: ""
  };
}

type PaymentStatus = { label: string; className: string };

function getPaymentStatus(total: number, paid: number, balanceDue: number): PaymentStatus {
  if (total > 0 && balanceDue <= 0) {
    return { label: "Paid", className: "border-emerald-600 bg-emerald-50 text-emerald-700" };
  }

  if (paid > 0) {
    return { label: "Partially paid", className: "border-amber-500 bg-amber-50 text-amber-700" };
  }

  return { label: "Unpaid", className: "border-red-500 bg-red-50 text-red-700" };
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-bold text-slate-950">{value || "-"}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  muted = true
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 py-1 ${muted ? "text-slate-600" : "font-bold text-slate-950"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function CustomerInvoicePage({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<TailorCustomer | null>(null);
  const [loadError, setLoadError] = useState("");
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);

  useEffect(() => {
    fetchCustomer(customerId)
      .then((record) => {
        if (!record) {
          setLoadError("Invoice order not found.");
          return;
        }

        setCustomer(record);
      })
      .catch(() => setLoadError("Unable to load the invoice."));
  }, [customerId]);

  const addExtraItem = () => {
    setExtraItems((current) => [...current, createExtraItem()]);
  };

  const updateExtraItem = (id: string, field: keyof Omit<ExtraItem, "id">, value: string) => {
    setExtraItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeExtraItem = (id: string) => {
    setExtraItems((current) => current.filter((item) => item.id !== id));
  };

  const order = useMemo(() => {
    if (!customer) {
      return { quantity: 1, unitPrice: 0, amount: 0, discount: 0, paid: 0 };
    }

    // The order form's price is per suit, so the line amount is qty × unit price.
    const quantity = Number.parseInt(customer.quantity || "1", 10) || 1;
    const unitPrice = parseAmount(customer.stitchingPrice);

    return {
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
      discount: parseAmount(customer.discount),
      paid: parseAmount(customer.advancePayment)
    };
  }, [customer]);

  const extraItemsAmount = extraItems.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * parseAmount(item.rate),
    0
  );

  // Standard invoice flow: Subtotal − Discount = Total; Total − Paid = Balance due.
  const subtotal = order.amount + extraItemsAmount;
  const total = Math.max(subtotal - order.discount, 0);
  const balance = total - order.paid;
  const balanceDue = Math.max(balance, 0);
  const credit = Math.max(-balance, 0);
  const status = getPaymentStatus(total, order.paid, balanceDue);

  const garmentParts = customer
    ? [customer.upperGarmentPart, customer.lowerGarmentPart].filter(
      (part) => part && part.toLowerCase() !== "none"
    )
    : [];

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-slate-950 sm:px-8 lg:px-12">
      <div className="print-hidden mx-auto mb-4 flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">
            Invoice print
          </p>
          <h1 className="mt-1 text-2xl font-bold">Customer order invoice</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/customers"
            className="rounded-md border border-[#d8ccb9] bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-[#fbfaf7]"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-[#102f2d] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#183936]"
          >
            Print invoice
          </button>
        </div>
      </div>

      <section className="invoice-print-area mx-auto max-w-4xl rounded-lg border border-[#e1d6c4] bg-white p-7 shadow-sm">
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {loadError}
          </div>
        ) : null}

        {customer ? (
          <>
            <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 border-b-2 border-slate-950 pb-5 text-slate-950">
              <ShopBrandText className="justify-self-start" />

              <div className="flex h-40 w-40 shrink-0 items-center justify-center">
                <Image
                  src="/brand/aans-fabric-logo-icon.png"
                  alt="Aans Fabrics & Tailors Ltd logo"
                  width={160}
                  height={160}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="w-64 shrink-0 justify-self-end">
                <p className="text-right text-3xl font-black uppercase tracking-[0.2em] text-[#0d6b5f]">
                  Invoice
                </p>
                <div className="mt-3 space-y-1 border-t border-slate-200 pt-3">
                  <MetaRow label="Invoice No." value={invoiceNumber(customer)} />
                  <MetaRow label="Invoice Date" value={formatDisplayDate(customer.orderDate)} />
                  <MetaRow label="Delivery Date" value={formatDisplayDate(customer.deliveryDate)} />
                  <MetaRow label="Customer ID" value={customer.customerIdNumber} />
                </div>
              </div>
            </header>

            <section className="mt-6 flex items-start justify-between gap-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bill To</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{customer.customerName || "-"}</p>
                {customer.phoneNumber ? (
                  <p className="text-sm text-slate-700">{customer.phoneNumber}</p>
                ) : null}
                {customer.address ? (
                  <p className="max-w-sm whitespace-pre-line text-sm text-slate-700">{customer.address}</p>
                ) : null}
              </div>
              <span
                className={`shrink-0 rounded-md border-2 px-4 py-1.5 text-sm font-black uppercase tracking-wide ${status.className}`}
              >
                {status.label}
              </span>
            </section>

            <section className="mt-6 overflow-hidden rounded border border-slate-950">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Description</th>
                    <th className="w-20 px-4 py-2.5 text-center font-bold">Qty</th>
                    <th className="w-32 px-4 py-2.5 text-right font-bold">Unit Price</th>
                    <th className="w-32 px-4 py-2.5 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{customer.outfitType || "Tailoring order"}</p>
                      {garmentParts.length > 0 ? (
                        <p className="text-xs text-slate-500">{garmentParts.join(" & ")}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">{order.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(order.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{money(order.amount)}</td>
                  </tr>
                  {extraItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(event) => updateExtraItem(item.id, "description", event.target.value)}
                          placeholder="Item description"
                          className="w-full border-b border-dotted border-slate-300 bg-transparent px-0 py-1 font-semibold text-slate-950 outline-none focus:border-slate-950"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.qty}
                          onChange={(event) => updateExtraItem(item.id, "qty", event.target.value)}
                          className="w-12 border-b border-dotted border-slate-300 bg-transparent px-0 py-1 text-center text-slate-950 outline-none focus:border-slate-950"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.rate}
                          onChange={(event) => updateExtraItem(item.id, "rate", event.target.value)}
                          placeholder="0.00"
                          className="w-20 border-b border-dotted border-slate-300 bg-transparent px-0 py-1 text-right text-slate-950 outline-none focus:border-slate-950"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold tabular-nums">
                            {money((Number(item.qty) || 0) * parseAmount(item.rate))}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExtraItem(item.id)}
                            className="print-hidden rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            &times;
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="print-hidden border-t border-slate-200 bg-[#fbfaf7] px-4 py-2">
                <button
                  type="button"
                  onClick={addExtraItem}
                  className="text-sm font-bold text-[#0d6b5f] hover:underline"
                >
                  + Add item
                </button>
              </div>
            </section>

            <section className="mt-6 flex items-start justify-between gap-8">
              <div className="min-w-0 text-sm text-slate-600">
                {customer.notes ? (
                  <p>
                    <span className="font-bold text-slate-950">Notes: </span>
                    {customer.notes}
                  </p>
                ) : null}
              </div>

              <div className="w-full max-w-xs shrink-0 text-sm">
                <SummaryRow label="Subtotal" value={money(subtotal)} />
                {order.discount > 0 ? <SummaryRow label="Discount" value={`-${money(order.discount)}`} /> : null}
                <div className="mt-1 border-t border-slate-300 pt-1">
                  <SummaryRow label="Total" value={money(total)} muted={false} />
                </div>
                <SummaryRow label="Advance / Deposit paid" value={`-${money(order.paid)}`} />
                {credit > 0 ? <SummaryRow label="Credit (overpaid)" value={money(credit)} /> : null}
                <div className="mt-2 flex items-center justify-between gap-4 rounded-md bg-slate-950 px-4 py-3 text-white">
                  <span className="text-sm font-bold uppercase tracking-wide">Balance Due</span>
                  <span className="text-xl font-black tabular-nums">{money(balanceDue)}</span>
                </div>
              </div>
            </section>

            <section className="mt-8 border-t-2 border-slate-950 pt-4">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">
                Customer Notice
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                <li className="flex gap-2">
                  <span className="text-slate-950">&bull;</span>
                  <span>Payment should be paid in advance for the stitching.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-950">&bull;</span>
                  <span>
                    Please wash your unstitched clothes yourself before bringing them to us.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-950">&bull;</span>
                  <span>We do not provide washing facilities.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-950">&bull;</span>
                  <span>If you require quick turnaround, the fee will be extra.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-950">&bull;</span>
                  <span>
                    If you give us wrong measurements of the clothes, then we will charge extra
                    for the alteration.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-950">&bull;</span>
                  <span>Dupatta piping, dupatta pico, buttons and zip will have extra charge.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-slate-950">&bull;</span>
                  <span className="font-bold text-slate-950">
                    I will dispose of all garments not collected within 3 months.
                  </span>
                </li>
              </ul>
            </section>

            <footer className="mt-8 border-t border-dashed border-slate-400 pt-4 text-center text-xs text-slate-500">
              <p className="font-bold text-slate-700">Thank you for your business.</p>
              <p className="mt-1">
                If you have any questions concerning this invoice, please contact us on 0161 509 7737 or
                07915 253239.
              </p>
            </footer>
          </>
        ) : null}
      </section>
    </main>
  );
}
