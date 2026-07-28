"use client";

import { useId, useState } from "react";
import type { DeliveryReminder } from "@/lib/deliveryReminders";
import type { TailorCustomer } from "@/types/customer";

type WarningEntry = { order: TailorCustomer; reminder: DeliveryReminder };

type WarningLevel = "warning" | "critical";

type Bucket = {
  key: string;
  label: string;
  level: WarningLevel;
  count: number;
  orders: TailorCustomer[];
};

const STATUS: Record<WarningLevel, { fill: string; text: string; icon: string; name: string }> = {
  warning: { fill: "#fab219", text: "#8a6414", icon: "⚠", name: "Warning" },
  critical: { fill: "#d03b3b", text: "#a13d2c", icon: "⛔", name: "Critical" }
};

const BUCKET_DEFS: {
  key: string;
  label: string;
  level: WarningLevel;
  match: (daysUntil: number) => boolean;
}[] = [
  { key: "3d", label: "3 days left", level: "warning", match: (d) => d === 3 },
  { key: "2d", label: "2 days left", level: "critical", match: (d) => d === 2 },
  { key: "1d", label: "Tomorrow", level: "critical", match: (d) => d === 1 },
  { key: "0d", label: "Today", level: "critical", match: (d) => d === 0 },
  { key: "od", label: "Overdue", level: "critical", match: (d) => d < 0 }
];

function buildBuckets(warningOrders: WarningEntry[]): Bucket[] {
  return BUCKET_DEFS.map((def) => {
    const matches = warningOrders.filter((entry) => def.match(entry.reminder.daysUntil));
    return {
      key: def.key,
      label: def.label,
      level: def.level,
      count: matches.length,
      orders: matches.map((entry) => entry.order)
    };
  });
}

function niceAxisMax(maxValue: number) {
  if (maxValue <= 4) {
    return 4;
  }
  return Math.ceil(maxValue / 5) * 5;
}

export function DeliveryWarningChart({ warningOrders }: { warningOrders: WarningEntry[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const tooltipBaseId = useId();

  const buckets = buildBuckets(warningOrders);
  const axisMax = niceAxisMax(Math.max(...buckets.map((bucket) => bucket.count), 0));
  const yAxisTicks = [axisMax, Math.round(axisMax / 2), 0];
  const chartHeight = 180;

  return (
    <div className="mt-6 rounded-lg border border-[#e1d6c4] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0d6b5f]">
            Delivery warnings
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Orders by days to deadline
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: STATUS.warning.text }}
          >
            <span aria-hidden className="text-sm leading-none">
              {STATUS.warning.icon}
            </span>
            Warning · 3 days left
          </span>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: STATUS.critical.text }}
          >
            <span aria-hidden className="text-sm leading-none">
              {STATUS.critical.icon}
            </span>
            Critical · 2 days or less
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <div
          className="flex shrink-0 flex-col justify-between pb-1 text-right text-[11px] font-medium text-[#898781]"
          style={{ height: chartHeight }}
          aria-hidden
        >
          {yAxisTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className="flex-1">
          <div className="relative" style={{ height: chartHeight }}>
            <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
              {yAxisTicks.map((tick) => (
                <div key={tick} className="h-px w-full bg-[#e1d6c4]" />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end gap-4">
              {buckets.map((bucket) => {
                const status = STATUS[bucket.level];
                const heightPercent = axisMax > 0 ? (bucket.count / axisMax) * 100 : 0;
                const isActive = activeKey === bucket.key;
                const tooltipId = `${tooltipBaseId}-${bucket.key}`;

                return (
                  <div
                    key={bucket.key}
                    className="relative flex h-full flex-1 items-end justify-center"
                  >
                    {bucket.count > 0 && (
                      <span className="absolute bottom-full mb-1 text-xs font-bold text-slate-700">
                        {bucket.count}
                      </span>
                    )}
                    <button
                      type="button"
                      className="w-full max-w-[26px] cursor-default rounded-t-[4px] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d6b5f]"
                      style={{
                        height: `${bucket.count > 0 ? Math.max(heightPercent, 4) : 1}%`,
                        backgroundColor: status.fill,
                        opacity: isActive ? 1 : 0.85
                      }}
                      onMouseEnter={() => setActiveKey(bucket.key)}
                      onMouseLeave={() =>
                        setActiveKey((current) => (current === bucket.key ? null : current))
                      }
                      onFocus={() => setActiveKey(bucket.key)}
                      onBlur={() =>
                        setActiveKey((current) => (current === bucket.key ? null : current))
                      }
                      aria-describedby={tooltipId}
                      aria-label={`${bucket.label}: ${bucket.count} order${
                        bucket.count === 1 ? "" : "s"
                      }`}
                    />

                    {isActive && (
                      <div
                        id={tooltipId}
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-8 w-48 -translate-x-1/2 rounded-md border border-[#e1d6c4] bg-white p-3 text-left shadow-lg"
                      >
                        <p className="text-sm font-bold text-slate-950">
                          {bucket.count} order{bucket.count === 1 ? "" : "s"} &middot; {bucket.label}
                        </p>
                        {bucket.orders.length > 0 ? (
                          <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                            {bucket.orders.slice(0, 4).map((order) => (
                              <li key={order.id}>{order.customerName || "Customer"}</li>
                            ))}
                            {bucket.orders.length > 4 && (
                              <li>+{bucket.orders.length - 4} more</li>
                            )}
                          </ul>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">No orders in this range</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex gap-4">
            {buckets.map((bucket) => (
              <span
                key={bucket.key}
                className="flex-1 text-center text-xs font-semibold text-[#52514e]"
              >
                {bucket.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
