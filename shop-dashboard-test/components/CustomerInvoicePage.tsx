"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { fetchCustomer } from "@/lib/customerApi";
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

function invoiceNumber(customer: TailorCustomer) {
  return `INV-${customer.createdAt.slice(0, 4)}-${customer.id.slice(0, 8).toUpperCase()}`;
}

function InvoiceFieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="shrink-0 font-bold uppercase text-slate-950">{label}:</span>
      <span className="min-w-0 flex-1 border-b border-dotted border-slate-400 pb-0.5 font-semibold text-slate-800">
        {value || " "}
      </span>
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

  const totals = useMemo(() => {
    if (!customer) {
      return {
        price: 0,
        advance: 0,
        discount: 0,
        remaining: 0
      };
    }

    return {
      price: parseAmount(customer.stitchingPrice),
      advance: parseAmount(customer.advancePayment),
      discount: parseAmount(customer.discount),
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
            <header className="flex flex-col gap-5 border-b-2 border-slate-950 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-1.5">
                  <Image
                    src="/brand/aans-fabric-logo-icon.png"
                    alt="Aans Fabrics & Tailors Ltd logo"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="brand-name text-2xl font-black leading-tight text-slate-950">
                    Aans Fabrics &amp; Tailors Ltd
                  </p>
                  <p className="mt-1 max-w-[220px] text-[10px] font-semibold uppercase leading-snug tracking-wide text-slate-500">
                    Specialists in Ladies &amp; Gents Tailoring &amp; Alteration
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-72">
                <p className="text-right text-lg font-black uppercase text-slate-950">
                  Invoice No.{" "}
                  <span className="text-[#0d6b5f]">{invoiceNumber(customer)}</span>
                </p>
                <div className="mt-3 space-y-1.5">
                  <InvoiceFieldLine label="ID" value={customer.customerIdNumber} />
                  <InvoiceFieldLine label="Name" value={customer.customerName} />
                  <InvoiceFieldLine label="Tel" value={customer.phoneNumber} />
                  <div className="flex gap-3">
                    <InvoiceFieldLine label="Date" value={customer.orderDate} />
                    <InvoiceFieldLine label="Due" value={customer.deliveryDate} />
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-3 flex flex-col items-center justify-between gap-1 border-b border-slate-950 pb-3 text-center text-xs font-semibold text-slate-700 sm:flex-row">
              <span>Tel: 0161 509 7737, 07915 253239</span>
              <span>aansfabricstailorsltd.com</span>
            </div>

            <section className="mt-5 overflow-hidden rounded border border-slate-950">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-3 py-2 font-bold">Description</th>
                    <th className="px-3 py-2 text-center font-bold">Qty</th>
                    <th className="px-3 py-2 text-right font-bold">Rate</th>
                    <th className="px-3 py-2 text-right font-bold">Amount</th>
                    <th className="px-3 py-2 text-right font-bold">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="px-3 py-4 font-semibold text-slate-950">
                      {customer.outfitType || "Tailor order"}
                    </td>
                    <td className="px-3 py-4 text-center">1</td>
                    <td className="px-3 py-4 text-right">£{formatAmount(totals.price)}</td>
                    <td className="px-3 py-4 text-right font-bold">
                      £{formatAmount(totals.price)}
                    </td>
                    <td className="px-3 py-4 text-right text-red-600">
                      {totals.discount > 0 ? `-£${formatAmount(totals.discount)}` : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {customer.notes ? (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-bold text-slate-950">Notes: </span>
                {customer.notes}
              </p>
            ) : null}

            <div className="ml-auto mt-6 w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>£{formatAmount(totals.price)}</span>
              </div>
              {totals.discount > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span>-£{formatAmount(totals.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>Advance paid</span>
                <span>-£{formatAmount(totals.advance)}</span>
              </div>
              <div className="flex items-center justify-between border-t-2 border-slate-950 pt-2 text-lg font-black uppercase text-slate-950">
                <span>Total: £</span>
                <span>{formatAmount(totals.remaining)}</span>
              </div>
            </div>

            <footer className="mt-8 border-t border-dashed border-slate-400 pt-4 text-center text-xs text-slate-500">
              If you have any questions concerning this invoice, use the following contact
              information: 0161 509 7737, 07915 253239
            </footer>
          </>
        ) : null}
      </section>
    </main>
  );
}
