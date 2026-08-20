"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchCustomer } from "@/lib/customerApi";
import type { TailorCustomer } from "@/types/customer";

export function CustomerLabelPage({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<TailorCustomer | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchCustomer(customerId)
      .then((record) => {
        if (!record) {
          setLoadError("Order not found.");
          return;
        }

        setCustomer(record);
      })
      .catch(() => setLoadError("Unable to load the label."));
  }, [customerId]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-slate-950 sm:px-8 lg:px-12">
      <div className="print-hidden mx-auto mb-4 flex max-w-xs flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">
            A6 label
          </p>
          <h1 className="mt-1 text-xl font-bold">Order label</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/customers"
            className="rounded-md border border-[#d8ccb9] bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-[#fbfaf7]"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-[#102f2d] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#183936]"
          >
            Print label
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="mx-auto max-w-xs rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {loadError}
        </div>
      ) : null}

      {customer ? (
        <div className="mx-auto h-[105mm] w-[148mm] overflow-hidden">
          <section
            className="label-print-area flex h-[148mm] w-[105mm] origin-top-left border border-slate-950 bg-white"
            style={{ transform: "rotate(90deg) translateY(-100%)" }}
          >
            <div className="relative flex-[2] border-r border-slate-950">
              <div className="absolute inset-0 flex -rotate-90 flex-col items-center justify-center gap-1 text-center">
                {/* <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer Address
                </p> */}
                <p className="mt-1 text-xl font-bold leading-snug text-slate-950">
                  {customer.customerName || "-"}
                </p>
                <p className="text-sm leading-snug text-slate-800">
                  {customer.address || "-"}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {customer.phoneNumber || "-"}
                </p>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-0 flex -rotate-90 flex-col items-center justify-center gap-1.5 whitespace-nowrap text-center">
                <div className="flex items-center gap-2">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-1.5">
                    <Image
                      src="/brand/aans-fabric-logo-icon.png"
                      alt="Aans Fabrics & Tailors Ltd logo"
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="brand-name text-left text-sm font-black leading-none text-slate-950">
                    Aans Fabrics &amp; Tailors Ltd
                  </p>
                </div>
                <p className="w-32 whitespace-normal text-center text-[10px] leading-tight text-slate-500">
                  343 Cheetham Hill Road, Manchester, M8 0SF
                </p>
                <p className="text-center text-[10px] leading-none text-slate-500">
                  0161 509 7737, 07915 253239
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
