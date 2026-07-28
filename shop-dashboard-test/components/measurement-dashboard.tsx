import type { ReactNode } from "react";
import type { TailorCustomer } from "@/types/customer";

function textValue(value?: string) {
  return value && value.trim() ? value : "-";
}

function measurementValue(value?: string) {
  return value && value.trim() ? `${value} inch` : "-";
}

function yesNo(value?: boolean) {
  return value ? "Yes" : "No";
}

export function InfoCard({
  title,
  children,
  action
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wide text-[#005f52]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#e7f4ef] text-sm text-[#005f52]">
            ●
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MeasurementCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-h-16 grid-cols-[28px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_8px_rgba(15,23,42,0.03)]">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#eff8f5] text-sm font-black text-[#005f52]">
        ◇
      </span>
      <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function DiagramLabel({
  x,
  y,
  title,
  value,
  side = "left"
}: {
  x: number;
  y: number;
  title: string;
  value: string;
  side?: "left" | "right";
}) {
  const lineX = side === "left" ? x + 98 : x;
  const endX = side === "left" ? x + 160 : x - 72;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width="104"
        height="56"
        rx="9"
        fill="#ffffff"
        stroke="#d8dee6"
      />
      <text x={x + 12} y={y + 22} fill="#64748b" fontSize="12" fontWeight="700">
        {title}
      </text>
      <text x={x + 12} y={y + 42} fill="#111827" fontSize="14" fontWeight="900">
        {value}
      </text>
      <path
        d={`M ${lineX} ${y + 28} H ${endX}`}
        fill="none"
        stroke="#8d99a6"
        strokeDasharray="4 4"
        strokeWidth="1.5"
      />
      <circle cx={endX} cy={y + 28} r="3" fill="#005f52" />
    </g>
  );
}

export function MeasurementDiagram({ customer }: { customer: TailorCustomer }) {
  return (
    <InfoCard
      title="Measurement Diagram"
      action={
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          Unit: Inch
        </span>
      }
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <svg
          className="h-auto w-full"
          viewBox="0 0 760 720"
          role="img"
          aria-label="Customer front and back measurement diagram"
        >
          <rect width="760" height="720" fill="#ffffff" />
          <rect x="0" y="0" width="760" height="42" fill="#005f52" />
          <text
            x="380"
            y="27"
            fill="#ffffff"
            fontSize="15"
            fontWeight="900"
            textAnchor="middle"
          >
            {(customer.customerCategory || "Men").toUpperCase()} -{" "}
            {(customer.outfitType || "Normal suit").toUpperCase()} MEASUREMENT
            SHEET
          </text>

          <text x="250" y="82" fill="#111827" fontSize="14" fontWeight="900">
            FRONT
          </text>
          <text x="506" y="82" fill="#111827" fontSize="14" fontWeight="900">
            BACK
          </text>

          <g fill="none" stroke="#0f2f2c" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(214 96)">
              <circle cx="58" cy="30" r="24" strokeWidth="2.8" />
              <path d="M38 58 C24 74 20 102 18 142 L8 274" strokeWidth="2.8" />
              <path d="M78 58 C92 74 96 102 98 142 L108 274" strokeWidth="2.8" />
              <path
                d="M24 88 C38 70 78 70 92 88 L112 408 C86 420 30 420 4 408 Z"
                strokeWidth="2.8"
              />
              <path d="M44 58 C48 76 68 76 72 58" strokeWidth="2.4" />
              <path d="M54 90 V408" strokeDasharray="4 4" strokeWidth="1.3" />
              <path d="M28 160 H88" strokeDasharray="4 4" strokeWidth="1.3" />
              <path d="M20 222 H96" strokeDasharray="4 4" strokeWidth="1.3" />
              <path d="M34 408 L30 566" strokeWidth="2.8" />
              <path d="M82 408 L86 566" strokeWidth="2.8" />
              <path d="M30 566 C18 574 20 586 42 586" strokeWidth="2.4" />
              <path d="M86 566 C104 574 102 586 78 586" strokeWidth="2.4" />
              <path d="M0 274 C10 294 20 296 28 282" strokeWidth="2.2" />
              <path d="M116 274 C106 294 96 296 88 282" strokeWidth="2.2" />
            </g>

            <g transform="translate(472 96)">
              <circle cx="58" cy="30" r="24" strokeWidth="2.8" />
              <path d="M38 58 C24 74 20 102 18 142 L8 274" strokeWidth="2.8" />
              <path d="M78 58 C92 74 96 102 98 142 L108 274" strokeWidth="2.8" />
              <path
                d="M24 88 C38 70 78 70 92 88 L112 408 C86 420 30 420 4 408 Z"
                strokeWidth="2.8"
              />
              <path d="M36 58 H80" strokeWidth="2.2" />
              <path d="M58 72 V408" strokeDasharray="4 4" strokeWidth="1.3" />
              <path d="M24 160 H92" strokeDasharray="4 4" strokeWidth="1.3" />
              <path d="M16 222 H100" strokeDasharray="4 4" strokeWidth="1.3" />
              <path d="M34 408 L30 566" strokeWidth="2.8" />
              <path d="M82 408 L86 566" strokeWidth="2.8" />
              <path d="M30 566 C18 574 20 586 42 586" strokeWidth="2.4" />
              <path d="M86 566 C104 574 102 586 78 586" strokeWidth="2.4" />
              <path d="M0 274 C10 294 20 296 28 282" strokeWidth="2.2" />
              <path d="M116 274 C106 294 96 296 88 282" strokeWidth="2.2" />
            </g>
          </g>

          <g>
            <DiagramLabel
              x={22}
              y={100}
              title="Neck / Collar"
              value={measurementValue(customer.neckSize)}
            />
            <DiagramLabel
              x={22}
              y={168}
              title="Chest"
              value={measurementValue(customer.chestWidth)}
            />
            <DiagramLabel
              x={22}
              y={236}
              title="Waist"
              value={measurementValue(customer.waistWidth)}
            />
            <DiagramLabel
              x={22}
              y={304}
              title="Arm Hole"
              value={measurementValue(customer.armHole)}
            />
            <DiagramLabel
              x={22}
              y={372}
              title="Sleeve Length"
              value={measurementValue(customer.sleeveLength)}
            />
            <DiagramLabel
              x={22}
              y={440}
              title="Bicep"
              value={measurementValue(customer.bicep)}
            />
            <DiagramLabel
              x={22}
              y={508}
              title="Cuff"
              value={measurementValue(customer.cuff)}
            />
            <DiagramLabel
              x={22}
              y={576}
              title="Qameez Length"
              value={measurementValue(customer.qameezLength)}
            />
            <DiagramLabel
              x={22}
              y={644}
              title="Daman Width"
              value={measurementValue(customer.damanWidth)}
            />

            <DiagramLabel
              x={632}
              y={100}
              title="Shoulder"
              value={measurementValue(customer.shoulder)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={168}
              title="Back Shoulder"
              value={measurementValue(customer.shoulder)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={236}
              title="Collar Height"
              value={measurementValue(customer.collarHeight)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={304}
              title="Side Pocket"
              value={yesNo(customer.sidePocket)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={372}
              title="Front Pocket"
              value={yesNo(customer.frontPocket)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={440}
              title="Shalwar Waist"
              value={measurementValue(customer.shalwarWaist)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={508}
              title="Hip"
              value={measurementValue(customer.hip)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={576}
              title="Thigh"
              value={measurementValue(customer.thigh)}
              side="right"
            />
            <DiagramLabel
              x={632}
              y={644}
              title="Poncha / Bottom"
              value={measurementValue(customer.bottomPoncha)}
              side="right"
            />
          </g>
        </svg>
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          All measurements are in inches.
        </div>
      </div>
    </InfoCard>
  );
}

export function CustomerInfoSection({ customer }: { customer: TailorCustomer }) {
  return (
    <InfoCard title="Customer Information">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MeasurementCard label="Customer Name" value={textValue(customer.customerName)} />
        <MeasurementCard label="Phone Number" value={textValue(customer.phoneNumber)} />
        <MeasurementCard label="Address" value={textValue(customer.address)} />
        <MeasurementCard label="Order Date" value={textValue(customer.orderDate)} />
        <MeasurementCard label="Delivery Date" value={textValue(customer.deliveryDate)} />
        <MeasurementCard label="Status" value={textValue(customer.orderStatus)} />
      </div>
    </InfoCard>
  );
}

export function OrderDetailsSection({ customer }: { customer: TailorCustomer }) {
  return (
    <InfoCard title="Order Details">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MeasurementCard label="Customer Type" value={textValue(customer.customerCategory)} />
        <MeasurementCard label="Outfit Type" value={textValue(customer.outfitType)} />
        <MeasurementCard label="Fabric Type" value={textValue(customer.fabricType)} />
        <MeasurementCard label="Suit Design" value={textValue(customer.suitDesign)} />
        <MeasurementCard label="Stitching Price" value={textValue(customer.stitchingPrice)} />
        <MeasurementCard label="Advance Payment" value={textValue(customer.advancePayment)} />
        <MeasurementCard label="Remaining Payment" value={textValue(customer.remainingPayment)} />
        <MeasurementCard label="Order Status" value={textValue(customer.orderStatus)} />
        <MeasurementCard label="Notes" value={textValue(customer.notes)} />
      </div>
    </InfoCard>
  );
}

export function SuitMeasurementsSection({ customer }: { customer: TailorCustomer }) {
  return (
    <InfoCard title="Suit / Qameez Measurements">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MeasurementCard label="Qameez Length" value={measurementValue(customer.qameezLength)} />
        <MeasurementCard label="Chest" value={measurementValue(customer.chestWidth)} />
        <MeasurementCard label="Waist Width" value={measurementValue(customer.waistWidth)} />
        <MeasurementCard label="Shoulder" value={measurementValue(customer.shoulder)} />
        <MeasurementCard label="Sleeve Length" value={measurementValue(customer.sleeveLength)} />
        <MeasurementCard label="Arm Hole" value={measurementValue(customer.armHole)} />
        <MeasurementCard label="Bicep" value={measurementValue(customer.bicep)} />
        <MeasurementCard label="Cuff" value={measurementValue(customer.cuff)} />
        <MeasurementCard label="Neck / Collar" value={measurementValue(customer.neckSize)} />
        <MeasurementCard label="Collar Height" value={measurementValue(customer.collarHeight)} />
        <MeasurementCard label="Collar Design" value={textValue(customer.collarDesign)} />
        <MeasurementCard label="Daman Width" value={measurementValue(customer.damanWidth)} />
        <MeasurementCard label="Side Pocket" value={yesNo(customer.sidePocket)} />
        <MeasurementCard label="Front Pocket" value={yesNo(customer.frontPocket)} />
        <MeasurementCard label="-" value="-" />
      </div>
    </InfoCard>
  );
}

export function TrouserMeasurementsSection({ customer }: { customer: TailorCustomer }) {
  return (
    <InfoCard title="Outfit / Shalwar / Trouser Measurements">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MeasurementCard label="Shalwar Length" value={measurementValue(customer.shalwarLength)} />
        <MeasurementCard label="Waist" value={measurementValue(customer.shalwarWaist)} />
        <MeasurementCard label="Hip" value={measurementValue(customer.hip)} />
        <MeasurementCard label="Thigh" value={measurementValue(customer.thigh)} />
        <MeasurementCard label="Bottom / Poncha" value={measurementValue(customer.bottomPoncha)} />
        <MeasurementCard label="Elastic" value={yesNo(customer.elastic)} />
        <MeasurementCard label="Zip" value={yesNo(customer.zip)} />
        <MeasurementCard label="-" value="-" />
        <MeasurementCard label="-" value="-" />
      </div>
    </InfoCard>
  );
}
