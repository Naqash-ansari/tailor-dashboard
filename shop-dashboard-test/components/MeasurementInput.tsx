"use client";

export const FRACTIONS = ["¼", "½", "¾"] as const;
type Fraction = (typeof FRACTIONS)[number];

const typedFractions: Record<string, Fraction> = {
    "1/4": "¼",
    "1/2": "½",
    "3/4": "¾",
    "¼": "¼",
    "½": "½",
    "¾": "¾"
};

// Splits "21 ¾" or "21 3/4" into { whole: "21", fraction: "¾" }. Returns null for anything else.
export function parseMeasurement(value: string) {
    const match = value.trim().match(/^(\d+)?\s*(1\/4|1\/2|3\/4|¼|½|¾)?$/);

    if (!match) {
        return null;
    }

    return { whole: match[1] ?? "", fraction: match[2] ? typedFractions[match[2]] : undefined };
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
    invalidHint = "Use a whole number with ¼, ½ or ¾, e.g. 21 ¾"
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
                    className={`shrink-0 cursor-pointer border-l border-[#d8ccb9] px-2 text-lg font-bold outline-none ${activeFraction ? "bg-[#0d6b5f] text-white" : "bg-[#f7f4ee] text-slate-800"
                        }`}
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
