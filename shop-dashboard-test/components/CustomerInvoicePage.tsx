"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

function invoiceNumber(customer: TailorCustomer) {
  return `INV-${customer.createdAt.slice(0, 4)}-${customer.id.slice(0, 8).toUpperCase()}`;
}

type ExtraItem = {
  id: string;
  description: string;
  qty: string;
  rate: string;
  discount: string;
};

function createExtraItem(): ExtraItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    qty: "1",
    rate: "",
    discount: ""
  };
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

  const extraItemsSummary = useMemo(() => {
    return extraItems.reduce(
      (acc, item) => {
        const amount = (Number(item.qty) || 0) * parseAmount(item.rate);
        const discount = parseAmount(item.discount);
        return {
          amount: acc.amount + amount,
          discount: acc.discount + discount
        };
      },
      { amount: 0, discount: 0 }
    );
  }, [extraItems]);

  const grandTotal =
    totals.remaining + extraItemsSummary.amount - extraItemsSummary.discount;

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
              <div className="flex items-center gap-3">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-2">
                  <Image
                    src="/brand/aans-fabric-logo-icon.png"
                    alt="Aans Fabrics & Tailors Ltd logo"
                    width={96}
                    height={96}
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
                    <InvoiceFieldLine label="Date" value={formatDisplayDate(customer.orderDate)} />
                    <InvoiceFieldLine label="Due" value={formatDisplayDate(customer.deliveryDate)} />
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
                  {extraItems.map((item) => {
                    const amount = (Number(item.qty) || 0) * parseAmount(item.rate);

                    return (
                      <tr key={item.id} className="group">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(event) =>
                              updateExtraItem(item.id, "description", event.target.value)
                            }
                            placeholder="Item description"
                            className="w-full border-b border-dotted border-slate-300 bg-transparent px-0 py-1 font-semibold text-slate-950 outline-none focus:border-slate-950"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.qty}
                            onChange={(event) =>
                              updateExtraItem(item.id, "qty", event.target.value)
                            }
                            className="w-12 border-b border-dotted border-slate-300 bg-transparent px-0 py-1 text-center text-slate-950 outline-none focus:border-slate-950"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.rate}
                            onChange={(event) =>
                              updateExtraItem(item.id, "rate", event.target.value)
                            }
                            placeholder="0.00"
                            className="w-20 border-b border-dotted border-slate-300 bg-transparent px-0 py-1 text-right text-slate-950 outline-none focus:border-slate-950"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-bold">
                          £{formatAmount(amount)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.discount}
                              onChange={(event) =>
                                updateExtraItem(item.id, "discount", event.target.value)
                              }
                              placeholder="0.00"
                              className="w-16 border-b border-dotted border-slate-300 bg-transparent px-0 py-1 text-right text-red-600 outline-none focus:border-slate-950"
                            />
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
                    );
                  })}
                </tbody>
              </table>
              <div className="print-hidden border-t border-slate-200 bg-[#fbfaf7] px-3 py-2">
                <button
                  type="button"
                  onClick={addExtraItem}
                  className="text-sm font-bold text-[#0d6b5f] hover:underline"
                >
                  + Add item
                </button>
              </div>
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
              {extraItemsSummary.amount > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>Additional items</span>
                  <span>£{formatAmount(extraItemsSummary.amount)}</span>
                </div>
              ) : null}
              {extraItemsSummary.discount > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>Additional discount</span>
                  <span>-£{formatAmount(extraItemsSummary.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>Advance paid</span>
                <span>-£{formatAmount(totals.advance)}</span>
              </div>
              <div className="flex items-center justify-between border-t-2 border-slate-950 pt-2 text-lg font-black uppercase text-slate-950">
                <span>Total: £</span>
                <span>{formatAmount(grandTotal)}</span>
              </div>
            </div>

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
              If you have any questions concerning this invoice, use the following contact
              information: 0161 509 7737, 07915 253239
            </footer>
          </>
        ) : null}
      </section>
    </main>
  );
}
