"use client";

import { useEffect, useMemo, useState } from "react";
import type { TailorCustomer } from "@/types/customer";

export type DeliveryWarningLevel = "red" | "yellow";

export type DeliveryReminder = {
  daysUntil: number;
  isCritical: boolean;
  warningLevel: DeliveryWarningLevel | null;
  label: string;
};

export type DeliveryNotice = {
  title: string;
  message: string;
};

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDeliveryReminder(order: TailorCustomer): DeliveryReminder | null {
  if (!order.deliveryDate || order.orderStatus === "Delivered") {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deliveryDate = parseDateOnly(order.deliveryDate);
  const diffDays = Math.round(
    (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      daysUntil: diffDays,
      isCritical: true,
      warningLevel: "red",
      label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`
    };
  }

  if (diffDays <= 2) {
    return {
      daysUntil: diffDays,
      isCritical: true,
      warningLevel: "red",
      label: diffDays === 0 ? "Due today" : diffDays === 1 ? "Due tomorrow" : "Due in 2 days"
    };
  }

  if (diffDays === 3) {
    return {
      daysUntil: diffDays,
      isCritical: false,
      warningLevel: "yellow",
      label: "Due in 3 days"
    };
  }

  return {
    daysUntil: diffDays,
    isCritical: false,
    warningLevel: null,
    label: `Due in ${diffDays} days`
  };
}

export function getCriticalDeliveryOrders(customers: TailorCustomer[]) {
  return customers
    .filter((order) => order.orderStatus !== "Delivered")
    .map((order) => ({ order, reminder: getDeliveryReminder(order) }))
    .filter(
      (item): item is { order: TailorCustomer; reminder: DeliveryReminder } =>
        Boolean(item.reminder && item.reminder.isCritical)
    )
    .sort((a, b) => a.reminder.daysUntil - b.reminder.daysUntil);
}

export function getDeliveryWarningOrders(customers: TailorCustomer[]) {
  return customers
    .filter((order) => order.orderStatus !== "Delivered")
    .map((order) => ({ order, reminder: getDeliveryReminder(order) }))
    .filter(
      (item): item is { order: TailorCustomer; reminder: DeliveryReminder } =>
        Boolean(item.reminder && item.reminder.warningLevel)
    )
    .sort((a, b) => a.reminder.daysUntil - b.reminder.daysUntil);
}

export function useDeliveryNotice(customers: TailorCustomer[]) {
  const [notice, setNotice] = useState<DeliveryNotice | null>(null);
  const criticalOrders = useMemo(() => getCriticalDeliveryOrders(customers), [customers]);
  const warningOrders = useMemo(() => getDeliveryWarningOrders(customers), [customers]);

  useEffect(() => {
    const mostUrgent = criticalOrders[0];

    if (mostUrgent) {
      setNotice({
        title: "Delivery reminder",
        message: `${mostUrgent.order.customerName || "Customer"}'s delivery is ${mostUrgent.reminder.label.toLowerCase()}.`
      });
    } else {
      setNotice(null);
    }
  }, [criticalOrders]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return { notice, dismiss: () => setNotice(null), criticalOrders, warningOrders };
}
