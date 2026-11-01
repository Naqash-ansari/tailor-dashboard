"use client";

import { useEffect, useState } from "react";
import { MeasurementInput, normalizeMeasurement } from "@/components/MeasurementInput";

// Test page only: nothing here touches the customers database or other pages.
const STORAGE_KEY = "measurement-test-record";

const measurementFields = [
    { key: "shirtLength", label: "Shirt Length" },
    { key: "chest", label: "Chest" },
    { key: "shoulder", label: "Shoulder" },
    { key: "sleeveLength", label: "Sleeve Length" },
    { key: "waist", label: "Waist" },
    { key: "neck", label: "Neck" },
    { key: "hip", label: "Hip" },
    { key: "shalwarLength", label: "Shalwar Length" },
    { key: "bottom", label: "Bottom / Pancha" },
    { key: "cuff", label: "Cuff" }
] as const;

type MeasurementKey = (typeof measurementFields)[number]["key"];

type TestRecord = {
    name: string;
    mobile: string;
    dressType: string;
    date: string;
    measurements: Record<MeasurementKey, string>;
};

const t = {
    title: "Measurement input test",
    subtitle: "Type a whole number, then pick a fraction (⅛ to ⅞). Nothing here is saved to real customers.",
    customer: "Customer Information",
    name: "Customer Name",
    mobile: "Mobile Number",
    dressType: "Dress Type",
    date: "Measurement Date",
    measurements: "Measurements",
    measurement: "Measurement",
    size: "Size",
    save: "Save (test)",
    load: "Load saved",
    clear: "Clear",
    print: "Print A4",
    saved: "Saved ✓",
    preview: "Print preview",
    remove: "Remove fraction",
    hint: "Use a whole number with an eighth (⅛ to ⅞), e.g. 21 ⅜"
};

function emptyRecord(): TestRecord {
    return {
        name: "",
        mobile: "",
        dressType: "",
        date: new Date().toISOString().slice(0, 10),
        measurements: Object.fromEntries(measurementFields.map((field) => [field.key, ""])) as Record<
            MeasurementKey,
            string
        >
    };
}

function readSaved(): TestRecord | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as TestRecord) : null;
    } catch {
        return null;
    }
}

function formatDate(value: string) {
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}-${month}-${year}` : value;
}

const inputClass =
    "w-full rounded-md border border-[#d8ccb9] bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-[#0d6b5f] focus:ring-2 focus:ring-[#0d6b5f]/15";

export default function MeasurementTestPage() {
    const [record, setRecord] = useState<TestRecord>(emptyRecord);
    const [justSaved, setJustSaved] = useState(false);

    useEffect(() => {
        const saved = readSaved();

        if (saved) {
            setRecord(saved);
        }
    }, []);

    useEffect(() => {
        if (!justSaved) {
            return;
        }

        const timer = window.setTimeout(() => setJustSaved(false), 2500);
        return () => window.clearTimeout(timer);
    }, [justSaved]);

    const setMeasurement = (key: MeasurementKey, value: string) =>
        setRecord((current) => ({ ...current, measurements: { ...current.measurements, [key]: value } }));

    const save = () => {
        const toSave: TestRecord = {
            ...record,
            measurements: Object.fromEntries(
                Object.entries(record.measurements).map(([key, value]) => [key, normalizeMeasurement(value)])
            ) as Record<MeasurementKey, string>
        };

        setRecord(toSave);
        setJustSaved(true);

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch {
            // Storage can be blocked; the saved text is still shown on screen.
        }
    };

    const load = () => {
        const saved = readSaved();

        if (saved) {
            setRecord(saved);
        }
    };

    const filledMeasurements = measurementFields.filter((field) => record.measurements[field.key]?.trim());

    return (
        <main className="min-h-screen bg-[#f7f4ee] px-4 py-6 sm:px-6 lg:px-8">
            {/* Page-local print rules, so the shared stylesheet stays untouched. */}
            <style>{`
                @media print {
                    .mt-print-area, .mt-print-area * { visibility: visible !important; }
                    .mt-print-area { position: absolute; inset: 0 auto auto 0; width: 196mm; color: #000; background: #fff; }
                    .mt-print-area tr { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>

            <div className="mx-auto max-w-5xl space-y-6">
                <header className="print-hidden">
                    <h1 className="text-2xl font-bold text-slate-950">{t.title}</h1>
                    <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
                </header>

                <section className="print-hidden rounded-xl border border-[#e1d6c4] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 rounded-lg bg-[#0f4b44] px-4 py-2 text-center text-lg font-bold text-white">
                        {t.customer}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-700">{t.name}</span>
                            <input
                                className={inputClass}
                                value={record.name}
                                onChange={(event) => setRecord({ ...record, name: event.target.value })}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-700">{t.mobile}</span>
                            <input
                                dir="ltr"
                                inputMode="tel"
                                className={inputClass}
                                value={record.mobile}
                                onChange={(event) => setRecord({ ...record, mobile: event.target.value })}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-700">{t.dressType}</span>
                            <input
                                className={inputClass}
                                value={record.dressType}
                                onChange={(event) => setRecord({ ...record, dressType: event.target.value })}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-700">{t.date}</span>
                            <input
                                type="date"
                                dir="ltr"
                                className={inputClass}
                                value={record.date}
                                onChange={(event) => setRecord({ ...record, date: event.target.value })}
                            />
                        </label>
                    </div>
                </section>

                <section className="print-hidden rounded-xl border border-[#e1d6c4] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 rounded-lg bg-[#0f4b44] px-4 py-2 text-center text-lg font-bold text-white">
                        {t.measurements} (inch)
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {measurementFields.map((field) => (
                            <MeasurementInput
                                key={field.key}
                                label={field.label}
                                value={record.measurements[field.key]}
                                onChange={(value) => setMeasurement(field.key, value)}
                                removeLabel={t.remove}
                                invalidHint={t.hint}
                            />
                        ))}
                    </div>
                </section>

                <div className="print-hidden flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={save}
                        className="rounded-md bg-[#0f4b44] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#135a52]"
                    >
                        {t.save}
                    </button>
                    <button
                        type="button"
                        onClick={load}
                        className="rounded-md border border-[#d8ccb9] bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-[#fbfaf7]"
                    >
                        {t.load}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecord(emptyRecord())}
                        className="rounded-md border border-[#d8ccb9] bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-[#fbfaf7]"
                    >
                        {t.clear}
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-md bg-[#0f4b44] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#135a52]"
                    >
                        {t.print}
                    </button>
                    {justSaved ? (
                        <span className="self-center text-sm font-bold text-[#0d6b5f]">{t.saved}</span>
                    ) : null}
                </div>

                <div>
                    <p className="print-hidden mb-2 text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">{t.preview}</p>
                    <section className="mt-print-area rounded-lg border border-slate-300 bg-white p-6 text-black shadow-sm">
                        <h2 className="border-b-2 border-black pb-2 text-center text-xl font-bold">{t.title.replace(" test", "")}</h2>
                        <table className="mt-4 w-full text-sm">
                            <tbody>
                                {[
                                    [t.name, record.name],
                                    [t.mobile, record.mobile],
                                    [t.dressType, record.dressType],
                                    [t.date, formatDate(record.date)]
                                ].map(([label, value]) => (
                                    <tr key={label} className="border-b border-slate-300">
                                        <th className="w-1/3 py-1.5 text-start font-bold">{label}</th>
                                        <td dir="ltr" className="py-1.5 text-start font-semibold">{value || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <table className="mt-5 w-full border-collapse text-base">
                            <thead>
                                <tr>
                                    <th className="border border-black px-3 py-2 text-start">{t.measurement}</th>
                                    <th className="w-40 border border-black px-3 py-2 text-center">{t.size} (inch)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filledMeasurements.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="border border-black px-3 py-2 text-center text-slate-500">-</td>
                                    </tr>
                                ) : (
                                    filledMeasurements.map((field) => (
                                        <tr key={field.key}>
                                            <td className="border border-black px-3 py-2 font-bold">{field.label}</td>
                                            <td dir="ltr" className="border border-black px-3 py-2 text-center text-lg font-bold">
                                                {record.measurements[field.key]}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </main>
    );
}
