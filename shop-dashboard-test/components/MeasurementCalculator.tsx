"use client";

import { evaluate, format } from "mathjs";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

type HistoryEntry = { expression: string; result: string };

const operators = ["+", "−", "×", "÷"];

const fractionKeys = [
  { label: "½", value: "1/2" },
  { label: "¼", value: "1/4" },
  { label: "¾", value: "3/4" },
  { label: "⅛", value: "1/8" }
];

// The display uses friendly symbols; mathjs needs plain ASCII operators.
function toMathExpression(expression: string) {
  return expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
}

function calculateExpression(expression: string): string | null {
  if (!expression.trim()) {
    return null;
  }

  try {
    const value = evaluate(toMathExpression(expression));

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return null;
    }

    // precision 10 removes floating point noise such as 0.1 + 0.2 = 0.30000000000000004.
    return format(value, { precision: 10 });
  } catch {
    return null;
  }
}

export function MeasurementCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const preview = calculateExpression(expression);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    panelRef.current?.focus();

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const append = (text: string) => {
    setShowError(false);
    setExpression((current) => {
      // Starting with an operator right after "=" continues from the last result.
      if (current === "" && lastResult && operators.includes(text)) {
        return `${lastResult} ${text} `;
      }

      if (operators.includes(text)) {
        const trimmed = current.trimEnd();
        const lastChar = trimmed.slice(-1);

        if (!trimmed) {
          return text === "−" ? "−" : current;
        }

        // Replace a trailing operator instead of stacking two of them.
        if (operators.includes(lastChar)) {
          return `${trimmed.slice(0, -1)}${text} `;
        }

        return `${trimmed} ${text} `;
      }

      return current + text;
    });
  };

  const backspace = () => {
    setShowError(false);
    setExpression((current) => current.trimEnd().slice(0, -1).trimEnd());
  };

  // "32" then "½" means 32½: group it as "(32 + 1/2)" so "32½ × 2" is 65, not 32 + 1/2 × 2.
  const appendFraction = (fraction: string) => {
    setShowError(false);
    setExpression((current) => {
      const base = (current === "" && lastResult ? lastResult : current).trimEnd();
      const trailingNumber = base.match(/(\d+(?:\.\d+)?)$/);

      if (trailingNumber) {
        return `${base.slice(0, trailingNumber.index)}(${trailingNumber[1]} + ${fraction})`;
      }

      return base.endsWith(")") ? `${base} + ${fraction}` : base + fraction;
    });
  };

  const clearAll = () => {
    setExpression("");
    setLastResult(null);
    setShowError(false);
  };

  const showResult = () => {
    if (!expression.trim()) {
      return;
    }

    const result = calculateExpression(expression);

    if (result === null) {
      setShowError(true);
      return;
    }

    setHistory((current) => [{ expression: expression.trim(), result }, ...current].slice(0, 4));
    setLastResult(result);
    setExpression("");
    setShowError(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keyMap: Record<string, string> = {
      "*": "×",
      x: "×",
      "/": "÷",
      "-": "−",
      "+": "+"
    };

    if (/^[0-9.()]$/.test(event.key)) {
      append(event.key);
    } else if (keyMap[event.key]) {
      append(keyMap[event.key]);
    } else if (event.key === "Enter" || event.key === "=") {
      showResult();
    } else if (event.key === "Backspace") {
      backspace();
    } else if (event.key === "Delete") {
      clearAll();
    } else if (event.key === "Escape") {
      setIsOpen(false);
    } else {
      return;
    }

    // Keep calculator keys from submitting the order form or typing elsewhere.
    event.preventDefault();
    event.stopPropagation();
  };

  const mainDisplay = expression ? expression : lastResult ?? "0";

  const keyClass =
    "h-11 rounded-xl bg-white text-lg font-semibold text-slate-800 shadow-sm ring-1 ring-[#e1d6c4] transition hover:bg-[#fbfaf7] active:scale-95";
  const operatorClass =
    "h-11 rounded-xl bg-[#0d6b5f]/10 text-lg font-bold text-[#0d6b5f] transition hover:bg-[#0d6b5f]/20 active:scale-95";
  const utilityClass =
    "h-11 rounded-xl bg-[#f2ece2] text-base font-bold text-slate-700 transition hover:bg-[#e9e0d1] active:scale-95";
  const fractionClass =
    "h-9 rounded-lg bg-[#fbf6ea] text-base font-bold text-[#8a6a1f] ring-1 ring-[#eadcb8] transition hover:bg-[#f6ecd4] active:scale-95";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/20"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
          <path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01" strokeLinecap="round" />
        </svg>
        Calculator
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Calculator"
          onKeyDown={handleKeyDown}
          className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-[#d8ccb9] bg-[#fcfbf8] p-3 text-left shadow-2xl outline-none"
        >
          <div className="mb-3 rounded-xl bg-gradient-to-br from-[#122b2a] to-[#1d4441] px-4 py-3 text-right">
            <p className="min-h-[1.25rem] truncate text-xs font-medium text-[#e8dfd2]/80">
              {expression && preview !== null ? `= ${preview}` : history[0] && !expression ? `${history[0].expression} =` : ""}
            </p>
            <p className={`truncate text-3xl font-bold tracking-tight ${showError ? "text-red-300" : "text-white"}`}>
              {showError ? "Error" : mainDisplay}
            </p>
          </div>

          <div className="mb-2 grid grid-cols-4 gap-2">
            {fractionKeys.map((fraction) => (
              <button
                key={fraction.value}
                type="button"
                title={`Add ${fraction.value}`}
                onClick={() => appendFraction(fraction.value)}
                className={fractionClass}
              >
                {fraction.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={clearAll} className={`${utilityClass} text-red-600`}>
              C
            </button>
            <button type="button" onClick={() => append("(")} className={utilityClass}>
              (
            </button>
            <button type="button" onClick={() => append(")")} className={utilityClass}>
              )
            </button>
            <button type="button" onClick={() => append("÷")} className={operatorClass}>
              ÷
            </button>
            {["7", "8", "9"].map((digit) => (
              <button key={digit} type="button" onClick={() => append(digit)} className={keyClass}>
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => append("×")} className={operatorClass}>
              ×
            </button>
            {["4", "5", "6"].map((digit) => (
              <button key={digit} type="button" onClick={() => append(digit)} className={keyClass}>
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => append("−")} className={operatorClass}>
              −
            </button>
            {["1", "2", "3"].map((digit) => (
              <button key={digit} type="button" onClick={() => append(digit)} className={keyClass}>
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => append("+")} className={operatorClass}>
              +
            </button>
            <button type="button" onClick={backspace} className={utilityClass} aria-label="Backspace">
              ⌫
            </button>
            <button type="button" onClick={() => append("0")} className={keyClass}>
              0
            </button>
            <button type="button" onClick={() => append(".")} className={keyClass}>
              .
            </button>
            <button
              type="button"
              onClick={showResult}
              className="h-11 rounded-xl bg-[#0d6b5f] text-lg font-bold text-white shadow-sm transition hover:bg-[#0b5a50] active:scale-95"
            >
              =
            </button>
          </div>

          {history.length > 0 ? (
            <div className="mt-3 border-t border-[#e1d6c4] pt-2">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">History</p>
              <ul className="space-y-0.5">
                {history.map((entry, index) => (
                  <li key={`${entry.expression}-${index}`}>
                    <button
                      type="button"
                      title="Use this result"
                      onClick={() => {
                        setExpression(entry.result);
                        setShowError(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-[#f2ece2]"
                    >
                      <span className="truncate text-slate-500">{entry.expression}</span>
                      <span className="font-bold text-slate-800">= {entry.result}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
