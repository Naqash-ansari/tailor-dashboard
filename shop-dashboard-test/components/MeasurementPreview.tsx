"use client";

import type { CustomerFormValues, TailorCustomer } from "@/types/customer";

type PreviewCustomer = CustomerFormValues | TailorCustomer;
type PatternKind =
  | "qameezFront"
  | "qameezBack"
  | "sleeve"
  | "shalwar"
  | "trouser"
  | "collar"
  | "cuff"
  | "pockets";

function value(customer: PreviewCustomer, key: keyof PreviewCustomer) {
  const fieldValue = customer[key];
  return !fieldValue || typeof fieldValue === "boolean" ? "-" : String(fieldValue);
}

function hasValue(customer: PreviewCustomer, key: keyof PreviewCustomer) {
  const fieldValue = customer[key];

  if (typeof fieldValue === "boolean") {
    return true;
  }

  return Boolean(String(fieldValue ?? "").trim());
}

function yesNo(fieldValue?: boolean) {
  return fieldValue ? "Yes" : "No";
}

function SummaryField({
  label,
  fieldValue,
  accent = false
}: {
  label: string;
  fieldValue: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className={accent ? "font-black text-[#0d6b5f]" : "font-black text-slate-950"}>
        {fieldValue}
      </p>
    </div>
  );
}

function PatternSvg({ kind }: { kind: PatternKind }) {
  return (
    <svg
      className="h-36 w-full"
      viewBox="0 0 220 150"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <marker
          id={`arrow-${kind}`}
          markerHeight="7"
          markerWidth="7"
          orient="auto-start-reverse"
          refX="6"
          refY="3.5"
        >
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#b8892d" />
        </marker>
      </defs>
      <rect width="220" height="150" rx="10" fill="#fffaf0" />
      <g
        fill="#fffdf8"
        stroke="#102f2d"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        {kind === "qameezFront" && (
          <>
            <path d="M72 132 L83 46 Q101 38 105 25 H132 Q137 38 155 46 L166 132 Z" />
            <path d="M105 26 Q118 45 132 26" fill="none" strokeWidth="2" />
            <path d="M118 50 V132" stroke="#8a98a8" strokeDasharray="6 6" strokeWidth="1.5" />
            <path d="M91 78 H145" stroke="#b8892d" strokeWidth="2" markerEnd={`url(#arrow-${kind})`} markerStart={`url(#arrow-${kind})`} />
            <path d="M82 132 H166" stroke="#b8892d" strokeWidth="2" markerEnd={`url(#arrow-${kind})`} markerStart={`url(#arrow-${kind})`} />
            <rect x="90" y="104" width="22" height="28" fill="#fffaf0" />
          </>
        )}

        {kind === "qameezBack" && (
          <>
            <path d="M68 132 L80 48 Q100 38 106 25 H134 Q140 38 160 48 L172 132 Z" />
            <path d="M86 25 H154" fill="none" />
            <path d="M120 50 V132" stroke="#8a98a8" strokeDasharray="6 6" strokeWidth="1.5" />
            <path d="M86 76 H154" stroke="#b8892d" strokeDasharray="8 8" strokeWidth="2" />
            <path d="M82 102 H158" stroke="#b8892d" strokeDasharray="8 8" strokeWidth="2" />
          </>
        )}

        {kind === "sleeve" && (
          <>
            <path d="M36 112 L72 38 H184 L152 126 Z" />
            <path d="M72 38 C104 58 145 58 184 38" fill="none" stroke="#8a98a8" strokeDasharray="7 7" strokeWidth="1.5" />
            <path d="M42 114 H154" stroke="#b8892d" strokeWidth="2" markerEnd={`url(#arrow-${kind})`} markerStart={`url(#arrow-${kind})`} />
            <path d="M72 30 H184" stroke="#b8892d" strokeWidth="2" markerEnd={`url(#arrow-${kind})`} markerStart={`url(#arrow-${kind})`} />
          </>
        )}

        {kind === "shalwar" && (
          <>
            <path d="M56 132 C34 82 42 48 66 22 H154 C178 48 186 82 164 132 Z" />
            <path d="M110 58 C116 84 116 108 110 132 C104 108 104 84 110 58 Z" fill="#fffaf0" />
            <path d="M110 62 V126" stroke="#8a98a8" strokeDasharray="6 6" strokeWidth="1.5" />
            <path d="M68 24 H152" stroke="#b8892d" strokeWidth="2" markerEnd={`url(#arrow-${kind})`} markerStart={`url(#arrow-${kind})`} />
            <path d="M54 75 H166" stroke="#b8892d" strokeWidth="2" markerEnd={`url(#arrow-${kind})`} markerStart={`url(#arrow-${kind})`} />
          </>
        )}

        {kind === "trouser" && (
          <>
            <path d="M54 130 L76 28 H112 L96 130 Z" />
            <path d="M124 28 H160 L178 130 H134 Z" />
            <path d="M76 28 H112 M124 28 H160" stroke="#8a98a8" strokeDasharray="7 7" strokeWidth="1.5" />
            <path d="M48 136 H182 V148 H48 Z" />
          </>
        )}

        {kind === "collar" && (
          <>
            <path d="M42 45 H172 L184 78 H54 Z" />
            <path d="M38 108 C78 84 146 84 186 108 V132 H38 Z" />
            <path d="M64 56 H164 M58 118 H166" stroke="#b8892d" strokeWidth="1.8" />
          </>
        )}

        {kind === "cuff" && (
          <>
            <path d="M38 34 H182 V66 H38 Z" />
            <path d="M38 92 C76 72 144 72 182 92 V124 H38 Z" />
            <path d="M58 50 H162 M58 108 H162" stroke="#b8892d" strokeWidth="1.8" />
          </>
        )}

        {kind === "pockets" && (
          <>
            <path d="M38 38 H112 L130 78 H38 Z" />
            <path d="M38 98 H118 V132 H38 Z" />
            <path d="M148 32 H166 V132 H148 Z" />
            <path d="M182 32 H200 V132 H182 Z" />
            <path d="M52 108 V128 M66 108 V128 M80 108 V128" stroke="#b8892d" strokeWidth="1.8" />
          </>
        )}
      </g>
    </svg>
  );
}

function PatternCard({
  title,
  kind,
  rows
}: {
  title: string;
  kind: PatternKind;
  rows: Array<[string, string]>;
}) {
  return (
    <article className="rounded-lg border border-[#e1d6c4] bg-white p-4 shadow-sm">
      <h3 className="text-sm font-black uppercase tracking-wide text-[#0f2f2c]">
        {title}
      </h3>
      <div className="mt-3 rounded-md border border-[#efe4d4] bg-[#fffaf0] p-2">
        <PatternSvg kind={kind} />
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map(([label, rowValue]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-md bg-[#fbfaf7] px-3 py-2 text-sm"
          >
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="font-black text-slate-950">{rowValue}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function DetailTile({
  label,
  value: tileValue,
  featured = false
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "rounded-md border border-[#d8b05b] bg-[#fff8e7] px-3 py-2"
          : "rounded-md bg-white px-3 py-2"
      }
    >
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="font-bold text-slate-950">{tileValue}</p>
    </div>
  );
}

export function MeasurementPreview({
  customer,
  compact = false
}: {
  customer: PreviewCustomer;
  compact?: boolean;
}) {
  const suitDetails: Array<[string, keyof PreviewCustomer, boolean?]> = [
    ["Qameez length", "qameezLength", true],
    ["Chest", "chestWidth", true],
    ["Waist width", "waistWidth"],
    ["Shoulder", "shoulder", true],
    ["Sleeve length", "sleeveLength"],
    ["Arm hole", "armHole"],
    ["Bicep", "bicep"],
    ["Cuff", "cuff"],
    ["Neck / collar", "neckSize"],
    ["Collar height", "collarHeight"],
    ["Collar design", "collarDesign"],
    ["Daman width", "damanWidth"]
  ];

  const lowerDetails: Array<[string, keyof PreviewCustomer, boolean?]> = [
    ["Shalwar length", "shalwarLength", true],
    ["Waist", "shalwarWaist"],
    ["Hip", "hip"],
    ["Thigh", "thigh"],
    ["Bottom / poncha", "bottomPoncha", true]
  ];

  const styleDetails: Array<[string, string]> = [
    ["Elastic", yesNo(customer.elastic)],
    ["Zip", yesNo(customer.zip)],
    ["Side pocket", yesNo(customer.sidePocket)],
    ["Front pocket", yesNo(customer.frontPocket)]
  ];

  const patternCards: Array<{
    title: string;
    kind: PatternKind;
    rows: Array<[string, string]>;
  }> = [
      {
        title: "Qameez Front",
        kind: "qameezFront",
        rows: [
          ["Length", value(customer, "qameezLength")],
          ["Chest", value(customer, "chestWidth")],
          ["Waist", value(customer, "waistWidth")],
          ["Daman", value(customer, "damanWidth")]
        ]
      },
      {
        title: "Qameez Back",
        kind: "qameezBack",
        rows: [
          ["Shoulder", value(customer, "shoulder")],
          ["Back length", value(customer, "qameezLength")],
          ["Collar height", value(customer, "collarHeight")]
        ]
      },
      {
        title: "Sleeve / Bazo",
        kind: "sleeve",
        rows: [
          ["Sleeve length", value(customer, "sleeveLength")],
          ["Arm hole", value(customer, "armHole")],
          ["Bicep", value(customer, "bicep")],
          ["Cuff", value(customer, "cuff")]
        ]
      },
      {
        title: "Shalwar",
        kind: "shalwar",
        rows: [
          ["Length", value(customer, "shalwarLength")],
          ["Waist", value(customer, "shalwarWaist")],
          ["Hip", value(customer, "hip")],
          ["Thigh", value(customer, "thigh")],
          ["Poncha", value(customer, "bottomPoncha")]
        ]
      },
      {
        title: "Trouser / Belt",
        kind: "trouser",
        rows: [
          ["Waist", value(customer, "shalwarWaist")],
          ["Hip", value(customer, "hip")],
          ["Elastic", yesNo(customer.elastic)],
          ["Zip", yesNo(customer.zip)]
        ]
      },
      {
        title: "Collar / Ban",
        kind: "collar",
        rows: [
          ["Neck", value(customer, "neckSize")],
          ["Collar height", value(customer, "collarHeight")],
          ["Design", value(customer, "collarDesign")]
        ]
      },
      {
        title: "Cuff Styles",
        kind: "cuff",
        rows: [
          ["Straight cuff", value(customer, "cuff")],
          ["Round cuff", value(customer, "cuff")]
        ]
      },
      {
        title: "Pockets / Patti",
        kind: "pockets",
        rows: [
          ["Side pocket", yesNo(customer.sidePocket)],
          ["Front pocket", yesNo(customer.frontPocket)]
        ]
      }
    ];

  const customerSummary = (
    <>
      <SummaryField label="Name" fieldValue={value(customer, "customerName")} />
      <SummaryField label="Phone" fieldValue={value(customer, "phoneNumber")} />
      <SummaryField label="Delivery date" fieldValue={value(customer, "deliveryDate")} />
      <SummaryField
        label="Status"
        fieldValue={value(customer, "orderStatus")}
        accent
      />
    </>
  );

  return (
    <section className="a4-print-area rounded-lg border border-[#e1d6c4] bg-white shadow-sm">
      <div className="border-b border-[#e1d6c4] px-5 py-4">
        <div className="print-sheet-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0d6b5f]">
              Measurement preview
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">
              {value(customer, "customerName")} simple cutting pattern sheet
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="print-header-user-summary grid gap-2 rounded-lg border border-[#e1d6c4] bg-white p-3 text-sm sm:grid-cols-2">
              {customerSummary}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="print-hidden w-fit rounded-md bg-[#102f2d] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#183936]"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      <div
        className={
          compact
            ? "print-content grid gap-5 p-5 lg:grid-cols-[1fr_0.8fr]"
            : "print-content grid gap-6 p-5 xl:grid-cols-[1.1fr_0.9fr]"
        }
      >
        <div className="print-side-details grid gap-4">
          <div className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">
              Suit / Qameez
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {suitDetails.filter(([, key]) => hasValue(customer, key)).map(([label, key, featured]) => (
                <DetailTile
                  key={label}
                  label={label}
                  value={value(customer, key)}
                  featured={featured}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">
              Shalwar / Trouser
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {lowerDetails.filter(([, key]) => hasValue(customer, key)).map(([label, key, featured]) => (
                <DetailTile
                  key={label}
                  label={label}
                  value={value(customer, key)}
                  featured={featured}
                />
              ))}
              {styleDetails.map(([label, fieldValue]) => (
                <DetailTile key={label} label={label} value={fieldValue} />
              ))}
            </div>
          </div>
        </div>

        <div className="print-art-sheet rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
          <div className="mb-4 flex flex-col gap-2 rounded-lg bg-[#102f2d] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="brand-name text-xs font-bold uppercase tracking-wide text-[#f7d98b]">
                Aans Fabrics & Tailors Ltd
              </p>
              <h3 className="text-xl font-black">Simple Suit Cutting Sheet</h3>
            </div>
            <span className="text-sm font-black text-[#f7d98b]">
              UNIT: {value(customer, "measurementUnit").toUpperCase()}
            </span>
          </div>

          <div className="print-pattern-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {patternCards.map((card) => (
              <PatternCard
                key={card.title}
                title={card.title}
                kind={card.kind}
                rows={card.rows}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
