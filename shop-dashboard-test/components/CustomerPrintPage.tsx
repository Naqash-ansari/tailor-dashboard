"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchCustomer } from "@/lib/customerApi";
import { formatDisplayDate } from "@/lib/formatDate";
import type { TailorCustomer } from "@/types/customer";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-[#e8dfd2]">
        {label}:
      </span>
      <span className="text-[10px] font-bold text-white">{value}</span>
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
  ["Hip", "upperHip"],
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
  const rows = fields
    .map(([label, key]) => [label, String(customer[key] ?? "").trim()] as const)
    .filter(([, value]) => value.length > 0);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="print-plain-card rounded-lg p-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">{title}</h3>
      <div className="mt-3 grid gap-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-md text-sm"
          >
            <span className="font-bold text-slate-700">{label}</span>
            <span className="font-bold text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const frontBackMensDesignImages: Record<string, string> = {
  "Curved Hem": "/front-back-mens/curved-hem.png",
  "Rounded Hem": "/front-back-mens/rounded-hem.png",
  "Straight Hem": "/front-back-mens/straight-hem.png",
  "Angled Collar": "/front-back-mens/angled-collar.png",
  "Placket Front": "/front-back-mens/placket-front.png",
  "Curved Placket": "/front-back-mens/curved-placket.png",
  "Dart Panel": "/front-back-mens/dart-panel.png"
};

const frontBackLadiesDesignImages: Record<string, string> = {
  "Straight Bodice": "/front-back-ladies/straight-bodice.png",
  "Curved Bodice": "/front-back-ladies/curved-bodice.png",
  "Dart Bodice": "/front-back-ladies/dart-bodice.png",
  "Flared Bodice": "/front-back-ladies/flared-bodice.png",
  "Draped Bodice": "/front-back-ladies/draped-bodice.png",
  "Double Dart Bodice": "/front-back-ladies/double-dart-bodice.png"
};

const waistcoatDesignImages: Record<string, string> = {
  "Straight Hem": "/waistcoat/straight-hem.png",
  "Notched Front": "/waistcoat/notched-front.png",
  "Stepped Hem": "/waistcoat/stepped-hem.png",
  "Angled Hem Right": "/waistcoat/angled-hem-right.png",
  "Angled Hem Left": "/waistcoat/angled-hem-left.png"
};

const ladiesFlairDesignImages: Record<string, string> = {
  "Curved Flair": "/ladies-flair/curved-flair.png",
  "A-Line Flair": "/ladies-flair/a-line-flair.png",
  "Straight Panel": "/ladies-flair/straight-panel.png",
  "Box Pleat Flair": "/ladies-flair/box-pleat-flair.png",
  "Gathered Panel": "/ladies-flair/gathered-panel.png"
};

const neckDesignImages: Record<string, string> = {
  Curved: "/neck/curved-ban.png",
  Straight: "/neck/straight-ban.png",
  Double: "/neck/double-ban.png",
  Stepped: "/neck/stepped-ban.png"
};

const sleeveStyleDesignImages: Record<string, string> = {
  "Long Tapered": "/sleeve/long-tapered.png",
  "Wide Tapered": "/sleeve/wide-tapered.png",
  "Narrow Tapered": "/sleeve/narrow-tapered.png",
  "Sleeve Cap": "/sleeve/sleeve-cap.png"
};

const cuffDesignImages: Record<string, string> = {
  Round: "/cuf/round-cuff.png",
  Angled: "/cuf/angled-cuff.png",
  Straight: "/cuf/straight-cuff.png",
  Pointed: "/cuf/pointed-cuff.png"
};

const frontStripDesignImages: Record<string, string> = {
  Pointed: "/strip/pointed-plain.png",
  Straight: "/strip/straight-plain.png",
  "Pointed with Notch": "/strip/pointed-notch.png",
  "Straight with Notch": "/strip/straight-notch.png"
};

const shoulderTeraDesignImages: Record<string, string> = {
  "Curved Notch": "/shoulder-tera/curved-notch.png",
  "Angled Notch": "/shoulder-tera/angled-notch.png"
};

const shoulderStrapDesignImages: Record<string, string> = {
  Pointed: "/strap/pointed-strap.svg",
  Straight: "/strap/straight-strap.svg"
};

const pocketDesignImages: Record<string, string> = {
  "Pointed Flap": "/pocket/pointed-flap.png",
  "Arched Flap": "/pocket/arched-flap.png",
  "Rounded Bottom": "/pocket/rounded-bottom.png",
  "Pointed Bottom": "/pocket/pointed-bottom.png",
  "Angled Bottom": "/pocket/angled-bottom.png"
};

const pocketFlapsDesignImages: Record<string, string> = {
  "Pointed Flap": "/pocket-flaps/pointed-flap.png",
  "Curved Flap": "/pocket-flaps/curved-flap.png",
  "Straight Flap": "/pocket-flaps/straight-flap.png"
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
  "Pleated Top": "/shalwar/pleated-top.png",
  "Seamed Cut": "/shalwar/seamed-cut.png",
  "Plain Cut": "/shalwar/plain-cut.png",
  "Pleated Bottom": "/shalwar/pleated-bottom.png"
};

const pantTrouserDesignImages: Record<string, string> = {
  "Tapered Leg": "/pant-trouser/tapered-leg.png",
  "Straight Leg": "/pant-trouser/straight-leg.png",
  "Fitted Leg": "/pant-trouser/fitted-leg.png",
  "Cutting Guide": "/pant-trouser/cutting-guide.png",
  "Waistband Panel": "/pant-trouser/waistband-panel.png",
  "Full Leg Pattern": "/pant-trouser/full-leg-pattern.png"
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
  unit,
  imageHeight = "h-14",
  imageWidth = "w-full"
}: {
  title: string;
  design: string;
  images: Record<string, string>;
  measurementValue: string;
  unit: string;
  imageHeight?: string;
  imageWidth?: string;
}) {
  const selectedDesigns = design
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && images[item]);

  if (selectedDesigns.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0 rounded-lg">
      {/* <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">{title}</h3> */}
      <div className="flex min-w-0 flex-col items-center gap-1.5">
        <div className={`flex min-w-0 flex-wrap items-center justify-center gap-2 ${imageWidth}`}>
          {selectedDesigns.map((designName) => (
            <div key={designName} className={`min-w-0 w-full max-w-full ${imageHeight}`}>
              <Image
                src={images[designName]}
                alt={`${designName} ${title}`}
                width={280}
                height={200}
                unoptimized
                className="h-full w-full object-contain object-top"
              />
            </div>
          ))}
        </div>
        {measurementValue ? (
          <div className="text-center leading-none">
            <p className="text-sm font-black text-[#0d6b5f]">{measurementValue}</p>
            {/* <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0d6b5f]/70">
              {unit}
            </p> */}
          </div>
        ) : null}
        {/* <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {design}
        </span> */}
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
          <section className="a4-print-area rounded-lg  bg-white shadow-sm">
            <div className="print-plain-header rounded-t-lg bg-[#122b2a] p-3 text-white">
              <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex flex-row items-center gap-3">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white p-2">
                    <Image
                      src="/brand/aans-fabric-logo-icon.png"
                      alt="Aans Fabrics & Tailors Ltd logo"
                      width={96}
                      height={96}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="brand-name whitespace-nowrap text-base font-bold sm:text-lg">Aans Fabrics & Tailors Ltd</h1>
                    <p className="whitespace-nowrap text-[15px] font-semibold text-[#e8dfd2]">0161 509 7737, 07915 253239</p>
                  </div>
                </div>
                <div className="flex w-56 shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5">
                  <DetailRow label="Customer" value={customer.customerName || "-"} />
                  <DetailRow label="Phone" value={customer.phoneNumber || "-"} />
                  <DetailRow label="Order ID" value={customer.customerIdNumber || "-"} />
                  <DetailRow label="Order Date" value={customer.orderDate ? formatDisplayDate(customer.orderDate) : "-"} />
                  <DetailRow label="Delivery" value={customer.deliveryDate ? formatDisplayDate(customer.deliveryDate) : "-"} />
                </div>
              </div>
            </div>
            <div className="border-b border-[#e1d6c4]" />
            <div className="flex flex-row gap-4 p-6">
              <div className="flex w-64 shrink-0 flex-col gap-4 border-r border-[#e1d6c4] pr-4">
                <h2 className="border-b border-[#e1d6c4] pb-2 text-sm font-black uppercase tracking-wide text-[#0d6b5f]">
                  Measurement Detail ({customer.measurementUnit || "inch"})
                </h2>
                <MeasurementSection
                  title={customer.upperGarmentPart || "Upper Body Measurements"}
                  fields={upperBodyFields}
                  customer={customer}
                />
                <MeasurementSection
                  title={customer.lowerGarmentPart || "Lower Body Measurements"}
                  fields={lowerBodyFields}
                  customer={customer}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <h2 className="border-b border-[#e1d6c4] pb-2 text-sm font-black uppercase tracking-wide text-[#0d6b5f]">
                  Designing &amp; Stitching Details
                </h2>
                {(() => {
                  const stitchingNotes: Array<[string, string]> = [
                    ["Fitting Style", customer.fittingStyle] as [string, string],
                    ["Seam Style", customer.seamStyle] as [string, string],
                    ["Side Chaak / Slit", customer.sideChaakSlit] as [string, string],
                    ["Plates / Darts", customer.platesDarts] as [string, string],
                    ["Button", customer.buttonDetails] as [string, string],
                    ["Pipping", customer.piping] as [string, string],
                    ["Dupatta / Veil", customer.dupattaVeil] as [string, string],
                    ["Design Reference", customer.suitDesign || customer.fabricType] as [string, string]
                  ].filter(([, value]) => Boolean(value));

                  if (stitchingNotes.length === 0) {
                    return null;
                  }

                  return (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      {stitchingNotes.map(([label, value]) => (
                        <div key={label} className="flex items-center gap-1">
                          <span className="font-bold text-slate-700">{label}:</span>
                          <span className="font-bold text-slate-950">{value}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="grid min-w-0 grid-cols-4 gap-4">
                  <DesignImageSection
                    title="Waistcoat Design"
                    design={customer.waistcoat}
                    images={waistcoatDesignImages}
                    measurementValue={(customer.waistcoatValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                  />
                  <DesignImageSection
                    title="Ladies Flair Design"
                    design={customer.ladiesFlair}
                    images={ladiesFlairDesignImages}
                    measurementValue={(customer.ladiesFlairValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                  />
                  <DesignImageSection
                    title="Neck Design"
                    design={customer.collarDesign || customer.neckDesign}
                    images={neckDesignImages}
                    measurementValue={(customer.neckDesignValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                  />
                  <DesignImageSection
                    title="Sleeve Design"
                    design={customer.sleeveStyle}
                    images={sleeveStyleDesignImages}
                    measurementValue={(customer.sleeveStyleValue || "").trim()}
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
                    title="Pocket Flaps Design"
                    design={customer.pocketFlaps}
                    images={pocketFlapsDesignImages}
                    measurementValue={(customer.pocketFlapsValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                  />
                  <DesignImageSection
                    title="Shoulder Design"
                    design={customer.shoulderTera}
                    images={shoulderTeraDesignImages}
                    measurementValue={(customer.shoulderTeraValue || "").trim()}
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
                    title="Ankle / Pancha Design"
                    design={customer.anklePancha}
                    images={anklePanchaDesignImages}
                    measurementValue={(customer.anklePanchaValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                  />
                </div>

                <div className="grid min-w-0 grid-cols-6 gap-4">
                  <DesignImageSection
                    title="Pocket Design"
                    design={customer.pocketStyle}
                    images={pocketDesignImages}
                    measurementValue={(customer.pocketStyleValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                    imageHeight="h-44"
                    imageWidth="w-full"
                  />
                  <DesignImageSection
                    title="Front Strip Design"
                    design={customer.frontStrip}
                    images={frontStripDesignImages}
                    measurementValue={(customer.frontStripValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                    imageHeight="h-44"
                    imageWidth="w-full"
                  />
                  <DesignImageSection
                    title="Front/Back Mens Design"
                    design={customer.frontBackMens}
                    images={frontBackMensDesignImages}
                    measurementValue={(customer.frontBackMensValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                    imageHeight="h-44"
                    imageWidth="w-full"
                  />
                  <DesignImageSection
                    title="Front/Back Ladies Design"
                    design={customer.frontBackLadies}
                    images={frontBackLadiesDesignImages}
                    measurementValue={(customer.frontBackLadiesValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                    imageHeight="h-44"
                    imageWidth="w-full"
                  />
                  <DesignImageSection
                    title="Shalwar Design"
                    design={customer.shalwarStyle}
                    images={shalwarStyleDesignImages}
                    measurementValue={(customer.shalwarStyleValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                    imageHeight="h-44"
                    imageWidth="w-full"
                  />
                  <DesignImageSection
                    title="Pant / Trouser Design"
                    design={customer.pantTrouserStyle}
                    images={pantTrouserDesignImages}
                    measurementValue={(customer.pantTrouserStyleValue || "").trim()}
                    unit={customer.measurementUnit || "inch"}
                    imageHeight="h-44"
                    imageWidth="w-full"
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
