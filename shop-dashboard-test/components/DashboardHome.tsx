"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  fetchCustomers,
  migrateLegacyLocalStorageCustomers
} from "@/lib/customerApi";
import { useDeliveryNotice } from "@/lib/deliveryReminders";
import { formatDisplayDate } from "@/lib/formatDate";
import { DeliveryReminderToast } from "@/components/DeliveryReminderToast";
import { DeliveryWarningChart } from "@/components/DeliveryWarningChart";
import { LoadingState } from "@/components/LoadingState";
import type { OrderStatus, TailorCustomer } from "@/types/customer";

const statusOrder: OrderStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
  "Delivered"
];

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0
  }).format(value);
}

function isOrderComplete(customer: TailorCustomer) {
  return customer.orderStatus === "Delivered" && parseAmount(customer.remainingPayment) <= 0;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeeklyOrderCounts(customers: TailorCustomer[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      key: toDateKey(date)
    };
  });

  const counted = days.map((day) => ({
    ...day,
    count: customers.filter((customer) => customer.orderDate === day.key).length
  }));

  const maxCount = Math.max(...counted.map((day) => day.count), 1);

  return counted.map((day) => ({
    ...day,
    percent: Math.round((day.count / maxCount) * 100)
  }));
}

export function DashboardHome() {
  const [customers, setCustomers] = useState<TailorCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPageRaw, setRecentPageRaw] = useState(1);
  const {
    notice: deliveryNotice,
    dismiss: dismissDeliveryNotice,
    warningOrders
  } = useDeliveryNotice(customers);

  useEffect(() => {
    migrateLegacyLocalStorageCustomers()
      .then(fetchCustomers)
      .then(setCustomers)
      .catch(() => setCustomers([]))
      .finally(() => setIsLoading(false));
  }, []);

  const weeklyOrderCounts = useMemo(() => getWeeklyOrderCounts(customers), [customers]);

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const uniqueCustomers = new Set(
      customers.map((customer) => {
        const idNumber = customer.customerIdNumber.trim().toLowerCase();

        if (idNumber) {
          return idNumber;
        }

        const phone = customer.phoneNumber.trim().toLowerCase();
        const name = customer.customerName.trim().toLowerCase();
        return phone || name || customer.id;
      })
    ).size;
    const todayOrders = customers.filter(
      (customer) => customer.orderDate === today
    ).length;
    const pendingPayments = customers.reduce(
      (total, customer) => total + parseAmount(customer.remainingPayment),
      0
    );
    const delivered = customers.filter(
      (customer) => customer.orderStatus === "Delivered"
    ).length;
    const completedAndPaid = customers.filter(isOrderComplete).length;

    return {
      uniqueCustomers,
      todayOrders,
      pendingPayments,
      delivered,
      completedAndPaid
    };
  }, [customers]);

  const recentPageSize = 5;
  const totalRecentPages = Math.max(1, Math.ceil(customers.length / recentPageSize));
  const recentPage = Math.min(recentPageRaw, totalRecentPages);
  const recentCustomers = customers.slice(
    (recentPage - 1) * recentPageSize,
    recentPage * recentPageSize
  );

  const statusCounts = statusOrder.map((status) => ({
    status,
    count: customers.filter((customer) => customer.orderStatus === status).length
  }));

  const metrics = [
    {
      label: "Saved customers",
      value: dashboardStats.uniqueCustomers.toString(),
      hint: `${customers.length} total orders`,
      accent: "bg-[#0d6b5f]"
    },
    {
      label: "Today orders",
      value: dashboardStats.todayOrders.toString(),
      hint: "Orders dated today",
      accent: "bg-[#b8892d]"
    },
    {
      label: "Pending payments",
      value: `£${formatAmount(dashboardStats.pendingPayments)}`,
      hint: "Remaining balance",
      accent: "bg-[#7f1d1d]"
    },
    {
      label: "Closed orders",
      value: dashboardStats.completedAndPaid.toString(),
      hint: `${dashboardStats.delivered} delivered total`,
      accent: "bg-[#1f3a5f]"
    }
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-slate-950 sm:px-8 lg:px-12">
      <DeliveryReminderToast notice={deliveryNotice} onDismiss={dismissDeliveryNotice} />
      <section className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-lg border border-[#e1d6c4] bg-[#122b2a] shadow-xl">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white p-2 shadow-lg sm:h-28 sm:w-28">
                    <Image
                      src="/brand/aans-fabric-logo-icon.png"
                      alt="Aans Fabrics & Tailors Ltd logo"
                      width={112}
                      height={112}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    {/* <p className="text-sm font-semibold uppercase tracking-wide text-[#d8b05b]">
                      Tailor dashboard
                    </p> */}
                    <h1 className="brand-name mt-2 text-3xl font-bold text-white sm:text-4xl">
                      Aans Fabrics & Tailors Ltd
                    </h1>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-[#e8dfd2] sm:text-base">
                  Customer measurements, stitching orders, payments, and delivery
                  status in one clean browser dashboard.
                </p>
              </div>

              <nav className="flex flex-wrap gap-3">
                <Link
                  href="/customers/order"
                  className="rounded-md bg-[#d8b05b] px-5 py-2.5 text-sm font-bold text-[#122b2a] shadow-sm transition hover:bg-[#e4c171]"
                >
                  Add customer
                </Link>
                <Link
                  href="/customers"
                  className="rounded-md border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Saved customers
                </Link>
              </nav>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#e8dfd2]">
                    Weekly order flow
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {weeklyOrderCounts.reduce((total, day) => total + day.count, 0)} orders this week
                  </p>
                </div>
                <span className="rounded-full bg-[#d8b05b]/20 px-3 py-1 text-xs font-bold uppercase text-[#f7d98b]">
                  Live data
                </span>
              </div>
              <div className="mt-6 flex h-48 items-end gap-3">
                {weeklyOrderCounts.map((day, index) => (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-bold text-[#f7d98b]">{day.count}</span>
                    <div className="flex h-36 w-full items-end rounded-md bg-white/10 px-2">
                      <div
                        className="dashboard-bar w-full rounded-t-md bg-[#d8b05b]"
                        style={{
                          height: `${day.count > 0 ? Math.max(day.percent, 6) : 2}%`,
                          animationDelay: `${index * 90}ms`
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#e8dfd2]">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <DeliveryWarningChart warningOrders={warningOrders} />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <article
              key={metric.label}
              className="dashboard-card rounded-lg border border-[#e1d6c4] bg-white p-5 shadow-sm"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`h-1.5 w-14 rounded-full ${metric.accent}`} />
              <p className="mt-5 text-sm font-semibold text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{metric.hint}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-lg border border-[#e1d6c4] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#0d6b5f]">
                  Status pipeline
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Order progress
                </h2>
              </div>
              <Link
                href="/customers"
                className="w-fit rounded-md border border-[#d8b05b] px-4 py-2 text-sm font-bold text-[#7a5415] hover:bg-[#fff8e7]"
              >
                Manage records
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statusCounts.map((item) => {
                const percent = customers.length
                  ? Math.round((item.count / customers.length) * 100)
                  : 0;

                return (
                  <div
                    key={item.status}
                    className="rounded-lg border border-slate-200 bg-[#fbfaf7] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-800">
                        {item.status}
                      </p>
                      <span className="text-sm font-bold text-[#0d6b5f]">
                        {item.count}
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="dashboard-progress h-full rounded-full bg-[#0d6b5f]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {percent}% of total orders
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#e1d6c4] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7f1d1d]">
              Payment focus
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Balance collection
            </h2>
            <div className="mt-6 rounded-lg bg-[#122b2a] p-5 text-white">
              <p className="text-sm text-[#e8dfd2]">Pending balance</p>
              <p className="mt-2 text-3xl font-bold">
                £{formatAmount(dashboardStats.pendingPayments)}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="dashboard-progress h-full w-2/3 rounded-full bg-[#d8b05b]" />
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-lg border border-[#e1d6c4] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#e1d6c4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0d6b5f]">
                Recent customers
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Latest measurement records
              </h2>
            </div>
            <Link
              href="/customers/order"
              className="w-fit rounded-md bg-[#122b2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#183936]"
            >
              New measurement
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#fbfaf7] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Measurements</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4}>
                      <LoadingState label="Loading dashboard data..." />
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={4}>
                      No customers saved yet. Add your first customer record.
                    </td>
                  </tr>
                ) : (
                  recentCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-950">
                          {customer.customerName}
                        </div>
                        <div className="text-slate-500">{customer.phoneNumber}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <div>{customer.suitDesign || "Suit design not set"}</div>
                        <span className="mt-2 inline-flex rounded-full bg-[#d8b05b]/20 px-3 py-1 text-xs font-bold text-[#7a5415]">
                          {customer.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <div>
                          Chest {customer.chestWidth || "-"}{" "}
                          {customer.measurementUnit ?? "inch"}
                        </div>
                        <div>
                          Shoulder {customer.shoulder || "-"}{" "}
                          {customer.measurementUnit ?? "inch"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        £{customer.remainingPayment || "0"} remaining
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {customers.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-[#e1d6c4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/customers"
                className="w-fit rounded-md border border-[#d8b05b] px-4 py-2 text-sm font-bold text-[#7a5415] hover:bg-[#fff8e7]"
              >
                Show all customers
              </Link>

              {totalRecentPages > 1 ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRecentPageRaw((page) => Math.max(1, page - 1))}
                    disabled={recentPage === 1}
                    className="rounded-md border border-[#e1d6c4] px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-[#fbfaf7] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-semibold text-slate-600">
                    Page {recentPage} of {totalRecentPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRecentPageRaw((page) => Math.min(totalRecentPages, page + 1))
                    }
                    disabled={recentPage === totalRecentPages}
                    className="rounded-md border border-[#e1d6c4] px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-[#fbfaf7] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {warningOrders.length > 0 ? (
          <div className="mt-6 rounded-lg border border-[#e1d6c4] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#a13d2c]">
                  Delivery warnings
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {warningOrders.length} order{warningOrders.length === 1 ? "" : "s"} need attention
                </h2>
              </div>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {warningOrders.map(({ order, reminder }) => {
                const isYellow = reminder.warningLevel === "yellow";
                return (
                  <li
                    key={order.id}
                    className={
                      isYellow
                        ? "rounded-md border border-[#e7c98a] bg-[#fdf6e6] px-4 py-3"
                        : "rounded-md border border-[#e3b3a5] bg-[#fbf0ed] px-4 py-3"
                    }
                  >
                    <p className="font-bold text-slate-950">
                      {order.customerName || "Customer"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.outfitType || "Normal suit"}
                    </p>
                    <p
                      className={
                        isYellow
                          ? "mt-1 text-sm font-semibold text-[#8a6414]"
                          : "mt-1 text-sm font-semibold text-[#a13d2c]"
                      }
                    >
                      {reminder.label} · {formatDisplayDate(order.deliveryDate)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
