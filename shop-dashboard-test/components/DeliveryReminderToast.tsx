"use client";

import type { DeliveryNotice } from "@/lib/deliveryReminders";

export function DeliveryReminderToast({
  notice,
  onDismiss
}: {
  notice: DeliveryNotice | null;
  onDismiss: () => void;
}) {
  if (!notice) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(92vw,360px)] rounded-xl border border-red-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-red-700">
            {notice.title}
          </p>
          <p className="mt-1 text-sm text-slate-700">{notice.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}
