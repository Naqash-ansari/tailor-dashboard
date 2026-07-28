"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchCustomer } from "@/lib/customerApi";
import type { TailorCustomer } from "@/types/customer";

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0
  }).format(value);
}

function invoiceNumber(customer: TailorCustomer) {
  return `INV-${customer.createdAt.slice(0, 4)}-${customer.id.slice(0, 8).toUpperCase()}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-2 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right font-bold text-slate-950">{value}</span>
    </div>
  );
}

export function CustomerInvoicePage({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<TailorCustomer | null>(null);
  const [loadError, setLoadError] = useState("");

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

  useEffect(() => {
    if (!customer) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 450);

    return () => window.clearTimeout(timer);
  }, [customer]);

  const totals = useMemo(() => {
    if (!customer) {
      return {
        price: 0,
        advance: 0,
        remaining: 0
      };
    }

    return {
      price: parseAmount(customer.stitchingPrice),
      advance: parseAmount(customer.advancePayment),
      remaining: parseAmount(customer.remainingPayment)
    };
  }, [customer]);

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
            <header className="flex flex-col gap-6 border-b border-[#e1d6c4] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="brand-name text-sm font-black uppercase tracking-wide text-[#0d6b5f]">
                  Aans Fabrics & Tailors Ltd
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Invoice</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Simple Suit Cutting Sheet
                </p>
              </div>
              <div className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4 text-sm">
                <DetailRow label="Invoice" value={invoiceNumber(customer)} />
                <DetailRow label="Order date" value={customer.orderDate || "-"} />
                <DetailRow label="Delivery" value={customer.deliveryDate || "-"} />
                <DetailRow label="Status" value={customer.orderStatus} />
              </div>
            </header>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <section className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">
                  Customer
                </h3>
                <div className="mt-3">
                  <DetailRow label="Name" value={customer.customerName || "-"} />
                  <DetailRow label="Phone" value={customer.phoneNumber || "-"} />
                  <DetailRow label="Address" value={customer.address} />
                </div>
              </section>

              <section className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">
                  Order
                </h3>
                <div className="mt-3">
                  <DetailRow label="Category" value={customer.customerCategory} />
                  <DetailRow label="Outfit" value={customer.outfitType} />
                  <DetailRow label="Fabric" value={customer.fabricType} />
                  <DetailRow label="Suit design" value={customer.suitDesign} />
                </div>
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-lg border border-[#e1d6c4]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#102f2d] text-xs uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Item</th>
                    <th className="px-4 py-3 font-bold">Description</th>
                    <th className="px-4 py-3 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-4 py-4 font-bold text-slate-950">Stitching</td>
                    <td className="px-4 py-4 text-slate-600">
                      {customer.outfitType || "Tailor order"}
                    </td>
                    <td className="px-4 py-4 text-right font-black">
                      Rs {formatAmount(totals.price)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-bold text-slate-950">Advance</td>
                    <td className="px-4 py-4 text-slate-600">Paid by customer</td>
                    <td className="px-4 py-4 text-right font-black">
                      Rs {formatAmount(totals.advance)}
                    </td>
                  </tr>
                  <tr className="bg-[#fbfaf7]">
                    <td className="px-4 py-4 font-black text-slate-950" colSpan={2}>
                      Remaining balance
                    </td>
                    <td className="px-4 py-4 text-right text-lg font-black text-[#0d6b5f]">
                      Rs {formatAmount(totals.remaining)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {customer.notes ? (
              <section className="mt-6 rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">
                  Notes
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-700">{customer.notes}</p>
              </section>
            ) : null}

            <footer className="mt-8 flex flex-col gap-6 border-t border-[#e1d6c4] pt-5 text-sm text-slate-600 sm:flex-row sm:items-end sm:justify-between">
              <p>Thank you for your order.</p>
              <div className="w-52 border-t border-slate-400 pt-2 text-center font-bold text-slate-950">
                Authorized signature
              </div>
            </footer>
          </>
        ) : null}
      </section>
    </main>
  );
}
