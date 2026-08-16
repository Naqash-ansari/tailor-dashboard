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
    <div className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-3">
      {/* <h3 className="text-sm font-black uppercase tracking-wide text-[#0d6b5f]">{title}</h3> */}
      <div className="mt-2 flex flex-col items-center gap-1.5 rounded-md bg-white p-3">
        <Image
          src={image}
          alt={`${design} ${title}`}
          width={100}
          height={50}
          unoptimized
          className="h-10 w-auto object-contain"
        />
        {measurementValue ? (
          <div className="text-center leading-none">
            <p className="text-sm font-black text-[#0d6b5f]">{measurementValue}</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0d6b5f]/70">
              {unit}
            </p>
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
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-6">
              <DesignImageSection
                title="Front/Back Mens Design"
                design={customer.frontBackMens}
                images={frontBackMensDesignImages}
                measurementValue={(customer.frontBackMensValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
              <DesignImageSection
                title="Front/Back Ladies Design"
                design={customer.frontBackLadies}
                images={frontBackLadiesDesignImages}
                measurementValue={(customer.frontBackLadiesValue || "").trim()}
                unit={customer.measurementUnit || "inch"}
              />
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
                title="Pocket Design"
                design={customer.pocketStyle}
                images={pocketDesignImages}
                measurementValue={(customer.pocketStyleValue || "").trim()}
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
                title="Front Strip Design"
                design={customer.frontStrip}
                images={frontStripDesignImages}
                measurementValue={(customer.frontStripValue || "").trim()}
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
