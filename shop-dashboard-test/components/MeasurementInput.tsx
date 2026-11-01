"use client";

import { ChangeEvent, useRef, useState } from "react";

// Eighths of an inch, in tape order. Index + 1 is the number of eighths (2/8 is ¼, 4/8 is ½, ...).
export const FRACTIONS = ["⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"] as const;
type Fraction = (typeof FRACTIONS)[number];

function fractionFromEighths(eighths: number): Fraction | undefined {
    return Number.isInteger(eighths) && eighths >= 1 && eighths <= 7 ? FRACTIONS[eighths - 1] : undefined;
}

// Splits "21 ⅜", "21 3/8" or "21.375" into { whole: "21", fraction: "⅜" }.
// Typed fractions are reduced (2/8 becomes ¼). Returns null for anything that is not a whole number plus eighths.
export function parseMeasurement(value: string) {
    const trimmed = value.trim();
    const decimal = trimmed.match(/^(\d+)\.(\d+)$/);

    if (decimal) {
        const eighths = Number(`0.${decimal[2]}`) * 8;

        if (eighths === 0) {
            return { whole: decimal[1], fraction: undefined };
        }

        const fraction = fractionFromEighths(eighths);
        return fraction ? { whole: decimal[1], fraction } : null;
    }

    const match = trimmed.match(/^(\d+)?\s*(?:(\d)\/(\d)|([⅛¼⅜½⅝¾⅞]))?$/);

    if (!match) {
        return null;
    }

    if (match[4]) {
        return { whole: match[1] ?? "", fraction: match[4] as Fraction };
    }

    if (match[2]) {
        const [numerator, denominator] = [Number(match[2]), Number(match[3])];
        const fraction = [2, 4, 8].includes(denominator)
            ? fractionFromEighths(numerator * (8 / denominator))
            : undefined;
        return fraction ? { whole: match[1] ?? "", fraction } : null;
    }

    return { whole: match[1] ?? "", fraction: undefined };
}

function formatMeasurement(whole: string, fraction?: Fraction) {
    return [whole, fraction].filter(Boolean).join(" ");
}

// Shows typed fractions like "1/2" as "½"; never converts to decimals.
export function normalizeMeasurement(value: string) {
    const parsed = parseMeasurement(value);
    return parsed ? formatMeasurement(parsed.whole, parsed.fraction) : value.trim();
}

export function MeasurementInput({
    label,
    value,
    onChange,
    removeLabel = "Remove fraction",
    invalidHint = "Use a whole number with an eighth (⅛ to ⅞), e.g. 21 ⅜"
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    removeLabel?: string;
    invalidHint?: string;
}) {
    const parsed = parseMeasurement(value);
    const activeFraction = parsed?.fraction;

    // A new fraction replaces the old one; an empty choice removes it.
    const setFraction = (fraction?: Fraction) => {
        const whole = parsed?.whole ?? value.trim().match(/^\d+/)?.[0] ?? "";
        onChange(formatMeasurement(whole, fraction));
    };

    return (
        <div className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
            <div
                dir="ltr"
                className="flex items-stretch overflow-hidden rounded-md border border-[#d8ccb9] bg-white shadow-sm transition focus-within:border-[#0d6b5f] focus-within:ring-2 focus-within:ring-[#0d6b5f]/15"
            >
                <input
                    type="text"
                    dir="ltr"
                    inputMode="text"
                    autoComplete="off"
                    className="w-full min-w-0 bg-transparent px-3 py-2.5 text-left text-base font-semibold text-slate-950 outline-none"
                    value={value}
                    placeholder="21 ¾"
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={() => onChange(normalizeMeasurement(value))}
                />
                <select
                    aria-label={`${label} fraction`}
                    title={removeLabel}
                    value={activeFraction ?? ""}
                    onChange={(event) => setFraction((event.target.value || undefined) as Fraction | undefined)}
                    className="shrink-0 cursor-pointer border-l border-[#d8ccb9] bg-white px-2 text-lg font-bold text-slate-800 outline-none"
                >
                    <option value="" className="bg-white text-slate-800">–</option>
                    {FRACTIONS.map((fraction) => (
                        <option key={fraction} value={fraction} className="bg-white text-slate-800">
                            {fraction}
                        </option>
                    ))}
                </select>
            </div>
            {value.trim() && !parsed ? (
                <span className="mt-1 block text-xs text-amber-700">{invalidHint}</span>
            ) : null}
        </div>
    );
}

const trailingFraction = /\s?[⅛¼⅜½⅝¾⅞]$/;
const leadingFraction = /^\s?[⅛¼⅜½⅝¾⅞]/;

// Free-text values such as "4x3" or several lines hold more than one number, so the
// fraction is placed at the cursor instead of rewriting the whole value.
export function FractionTextField({
    value,
    onChange,
    multiline = false,
    rows = 3,
    name
}: {
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    rows?: number;
    name?: string;
}) {
    const fieldRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
    const [caret, setCaret] = useState<number | null>(null);
    const position = Math.min(caret ?? value.length, value.length);
    const activeFraction =
        value.slice(0, position).match(/[⅛¼⅜½⅝¾⅞]$/)?.[0] ??
        value.slice(position).match(leadingFraction)?.[0].trim() ??
        "";

    const rememberCaret = () => setCaret(fieldRef.current?.selectionStart ?? null);

    // A fraction touching the cursor (before or after it) is replaced; an empty choice removes it.
    const setFraction = (fraction: string) => {
        const beforeCaret = value.slice(0, position);
        const touchesBefore = trailingFraction.test(beforeCaret);
        let before = beforeCaret.replace(trailingFraction, "");
        const after = touchesBefore ? value.slice(position) : value.slice(position).replace(leadingFraction, "");

        if (fraction) {
            before += `${/\d$/.test(before) ? " " : ""}${fraction}`;
        }

        onChange(before + after);
        setCaret(before.length);
        requestAnimationFrame(() => {
            fieldRef.current?.focus();
            fieldRef.current?.setSelectionRange(before.length, before.length);
        });
    };

    const fieldProps = {
        ref: fieldRef,
        name,
        dir: "ltr" as const,
        autoComplete: "off",
        className: `w-full min-w-0 bg-transparent px-3 py-2.5 text-left text-sm text-slate-950 outline-none ${multiline ? "resize-y" : ""}`,
        value,
        onChange: (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            onChange(event.target.value);
            setCaret(event.target.selectionStart);
        },
        onSelect: rememberCaret,
        onKeyUp: rememberCaret,
        onClick: rememberCaret
    };

    return (
        <div
            dir="ltr"
            className="flex items-stretch overflow-hidden rounded-md border border-[#d8ccb9] bg-white shadow-sm transition focus-within:border-[#0d6b5f] focus-within:ring-2 focus-within:ring-[#0d6b5f]/15"
        >
            {multiline ? <textarea rows={rows} {...fieldProps} /> : <input type="text" {...fieldProps} />}
            <select
                aria-label="Fraction at cursor"
                title="Adds the fraction where the cursor is"
                value={activeFraction}
                onChange={(event) => setFraction(event.target.value)}
                className={`shrink-0 cursor-pointer border-l border-[#d8ccb9] px-2 text-lg font-bold outline-none ${multiline ? "self-start border-b py-2" : ""} bg-white text-slate-800`}
            >
                <option value="" className="bg-white text-slate-800">–</option>
                {FRACTIONS.map((fraction) => (
                    <option key={fraction} value={fraction} className="bg-white text-slate-800">
                        {fraction}
                    </option>
                ))}
            </select>
        </div>
    );
}
