"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchCustomer } from "@/lib/customerApi";
import type { TailorCustomer } from "@/types/customer";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-1.5 last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#e8dfd2]">
        {label}
      </span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

const upperBodyFields: Array<[string, keyof TailorCustomer]> = [
  ["Length", "qameezLength"],
  ["Blouse Length", "blouseLength"],
  ["Ghaira / Bottom", "ghairaBottom"],
  ["Shoulder", "shoulder"],
  ["Shoulder Down", "shoulderDown"],
  ["Shoulder Strap", "shoulderStrap"],
  ["Neck", "neckSize"],
  ["Shoulder to Apex Point", "shoulderToApexPoint"],
  ["Front Chest", "frontChest"],
  ["Upper Chest", "upperChest"],
  ["Chest", "chestWidth"],
  ["Under Chest", "underChest"],
  ["Upper Back", "upperBack"],
  ["Cross Back", "crossBack"],
  ["Waist", "waistWidth"],
  ["Hip", "hip"],
  ["Side Fitting Seam", "sideFittingSeem"],
  ["Sleeve Length", "sleeveLength"],
  ["Arm Hole", "armHole"],
  ["Bicep", "bicep"],
  ["Elbow", "elbow"],
  ["Forearm", "forearm"],
  ["Wrist / Cuff", "wristCuff"]
];

const lowerBodyFields: Array<[string, keyof TailorCustomer]> = [
  ["Length", "qameezLength"],
  ["Skirt Length", "skirtLength"],
  ["Choli / Frill Length", "choliFrillLength"],
  ["Waist / Belt", "waistBelt"],
  ["Hip", "hip"],
  ["Crotch / Rise", "crotchRise"],
  ["Front Rise", "frontRise"],
  ["Back Rise", "backRise"],
  ["Thigh", "thigh"],
  ["Right Thigh", "rightThigh"],
  ["Left Thigh", "leftThigh"],
  ["Inseam Length", "inseamLength"],
  ["Knees", "knees"],
  ["Calf", "calf"],
  ["Right Calf", "rightCalf"],
  ["Left Calf", "leftCalf"],
  ["Ankle / Bottom", "ankleBottom"]
];

function MeasurementSection({
  title,
  fields,
  customer
}: {
  title: string;
  fields: Array<[string, keyof TailorCustomer]>;
  customer: TailorCustomer;
}) {
  const unit = customer.measurementUnit || "inch";
  const rows = fields
    .map(([label, key]) => [label, String(customer[key] ?? "").trim()] as const)
    .filter(([, value]) => value.length > 0);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">{title}</h3>
      <div className="mt-3 grid gap-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm"
          >
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="font-bold text-slate-950">
              {value} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const neckDesignImages: Record<string, string> = {
  Straight: "/nick/straight-ban.png",
  Curved: "/nick/curved-ban.png"
};

const cuffDesignImages: Record<string, string> = {
  Round: "/cuf/round-cuff.png",
  Angled: "/cuf/angled-cuff.png",
  Straight: "/cuf/straight-cuff.png"
};

const frontStripDesignImages: Record<string, string> = {
  Pointed: "/strip/pointed-plain.svg",
  Straight: "/strip/straight-plain.svg",
  "Pointed with Notch": "/strip/pointed-notch.svg",
  "Straight with Notch": "/strip/straight-notch.svg"
};

const shoulderStrapDesignImages: Record<string, string> = {
  Pointed: "/strap/pointed-strap.svg",
  Straight: "/strap/straight-strap.svg"
};

const ghairaBottomDesignImages: Record<string, string> = {
  "Pleated - Curved": "/ghaira/pleated-curved.svg",
  "Pleated - Straight": "/ghaira/pleated-straight.svg",
  "Flared Panel": "/ghaira/flared-panel.svg"
};

const zipDesignImages: Record<string, string> = {
  Visible: "/zip/visible-zip.svg",
  Invisible: "/zip/invisible-zip.svg"
};

const shalwarStyleDesignImages: Record<string, string> = {
  "Regular Cut": "/shalwar/regular-cut.svg",
  "Narrow Cut": "/shalwar/narrow-cut.svg",
  "Pleated Cut": "/shalwar/pleated-cut.svg"
};

const pantTrouserDesignImages: Record<string, string> = {
  "Tapered Cut": "/pant/tapered-cut.png",
  "Straight Cut": "/pant/straight.png"
};

const anklePanchaDesignImages: Record<string, string> = {
  "Plain Hem": "/ankle/plain-hem.svg",
  "Gathered Pancha": "/ankle/gathered-pancha.svg",
  "Cuffed Band": "/ankle/cuffed-band.svg"
};

function DesignImageSection({
  title,
  design,
  images,
  measurementValue,
  unit
}: {
  title: string;
  design: string;
  images: Record<string, string>;
  measurementValue: string;
  unit: string;
}) {
  const image = design ? images[design] : undefined;

  if (!image) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">{title}</h3>
      <div className="mt-3 flex flex-col items-center gap-2 rounded-md bg-white p-4">
        <div className="flex w-full items-center justify-center gap-3">
          {measurementValue ? (
            <div className="flex items-center gap-2">
              <div className="text-right leading-none">
                <p className="text-xl font-black text-[#0d6b5f]">{measurementValue}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0d6b5f]/70">
                  {unit}
                </p>
              </div>
              <span className="h-px w-6 bg-[#0d6b5f]" />
            </div>
          ) : null}
          <Image
            src={image}
            alt={`${design} ${title}`}
            width={160}
            height={80}
            unoptimized
            className="h-16 w-auto object-contain"
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {design}
        </span>
      </div>
    </div>
  );
}

export function CustomerPrintPage({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<TailorCustomer | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchCustomer(customerId)
      .then((record) => {
        if (!record) {
          setLoadError("Customer order not found.");
          return;
        }

        setCustomer(record);
      })
      .catch(() => setLoadError("Unable to load the print sheet."));
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

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 sm:px-8 lg:px-12">
      <div className="print-hidden mx-auto mb-4 flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">
            A4 print sheet
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Customer order print
          </h1>
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
            Print A4
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {loadError}
          </div>
        ) : null}

        {customer ? (
          <section className="a4-print-area rounded-lg border border-[#e1d6c4] bg-white shadow-sm">
            <div className="rounded-t-lg bg-[#122b2a] p-6 text-white">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white p-1.5">
                    <Image
                      src="/brand/aans-fabric-logo-icon.png"
                      alt="Aans Fabrics & Tailors Ltd logo"
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f3d68c]">
                      Tailor measurement form
                    </p>
                    <h1 className="brand-name mt-1 text-2xl font-bold sm:text-3xl">Aans Fabrics & Tailors Ltd</h1>
                  </div>
                </div>
                <div className="w-full rounded-lg border border-white/15 bg-white/10 p-4 sm:w-auto sm:min-w-[220px]">
                  <DetailRow label="Customer" value={customer.customerName || "-"} />
                  <DetailRow label="Phone" value={customer.phoneNumber || "-"} />
                  <DetailRow label="Order ID" value={customer.customerIdNumber || "-"} />
                  <DetailRow label="Delivery" value={customer.deliveryDate || "-"} />
                  <DetailRow label="Status" value={customer.orderStatus} />
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <MeasurementSection
                title="Upper Body Measurements"
                fields={upperBodyFields}
                customer={customer}
              />
              <MeasurementSection
                title="Lower Body Measurements"
                fields={lowerBodyFields}
                customer={customer}
              />
            </div>
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
              <DesignImageSection
                title="Neck Design"
                design={customer.collarDesign || customer.neckDesign}
                images={neckDesignImages}
                measurementValue={(customer.neckDesignValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Cuff Design"
                design={customer.wristCuffStyle}
                images={cuffDesignImages}
                measurementValue={(customer.cuffDesignValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Front Strip Design"
                design={customer.frontStrip}
                images={frontStripDesignImages}
                measurementValue={(customer.frontStripValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Shoulder Strap Design"
                design={customer.shoulderStrapDetail}
                images={shoulderStrapDesignImages}
                measurementValue={(customer.shoulderStrapValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Ghaira / Bottom Design"
                design={customer.ghairaBottomDetail}
                images={ghairaBottomDesignImages}
                measurementValue={(customer.ghairaBottomValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Zip"
                design={customer.zipDetail}
                images={zipDesignImages}
                measurementValue={(customer.zipValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Shalwar Design"
                design={customer.shalwarStyle}
                images={shalwarStyleDesignImages}
                measurementValue={(customer.shalwarStyleValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Pant / Trouser Design"
                design={customer.pantTrouserStyle}
                images={pantTrouserDesignImages}
                measurementValue={(customer.pantTrouserStyleValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Ankle / Pancha Design"
                design={customer.anklePancha}
                images={anklePanchaDesignImages}
                measurementValue={(customer.anklePanchaValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
