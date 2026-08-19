"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  deleteCustomerRecord,
  fetchCustomers,
  migrateLegacyLocalStorageCustomers
} from "@/lib/customerApi";
import { getDeliveryReminder, useDeliveryNotice } from "@/lib/deliveryReminders";
import { toUkInternationalPhone } from "@/lib/ukPhone";
import type { TailorCustomer } from "@/types/customer";
import { MeasurementPreview } from "@/components/MeasurementPreview";
import { DeliveryReminderToast } from "@/components/DeliveryReminderToast";
import { LoadingState } from "@/components/LoadingState";

type CustomerGroup = {
  key: string;
  customerName: string;
  phoneNumber: string;
  customerIdNumber: string;
  notes: string;
  orders: TailorCustomer[];
};

function customerKey(customer: TailorCustomer) {
  const idNumber = customer.customerIdNumber.trim().toLowerCase();

  if (idNumber) {
    return idNumber;
  }

  const phone = customer.phoneNumber.trim().toLowerCase();
  const name = customer.customerName.trim().toLowerCase();
  return phone || name || customer.id;
}

function formatDate(value: string) {
  return value || "Not set";
}

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function getCompletionLabel(order: TailorCustomer) {
  const remaining = parseAmount(order.remainingPayment);

  if (order.orderStatus === "Delivered" && remaining <= 0) {
    return {
      label: "Order complete",
      className: "bg-emerald-50 text-emerald-700"
    };
  }

  if (order.orderStatus === "Delivered" && remaining > 0) {
    return {
      label: `Delivered - ${order.remainingPayment} due`,
      className: "bg-red-50 text-red-700"
    };
  }

  if (remaining <= 0 && order.stitchingPrice) {
    return {
      label: "Payment clear",
      className: "bg-blue-50 text-blue-700"
    };
  }

  return {
    label: "Payment pending",
    className: "bg-amber-50 text-amber-700"
  };
}

function isOrderClosed(order: TailorCustomer) {
  return order.orderStatus === "Delivered" && parseAmount(order.remainingPayment) <= 0;
}

function buildWhatsAppLink(order: TailorCustomer) {
  const internationalNumber = toUkInternationalPhone(order.phoneNumber);
  const message = `Hi ${order.customerName || "there"}, your order (${order.outfitType || "suit"}) is complete and ready for collection. - Aans Fabrics & Tailors Ltd`;
  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.11c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a16.3 16.3 0 0 1-1.94-.71 12.3 12.3 0 0 1-4.68-4.13c-.34-.46-.68-1-.68-1.66 0-.65.34-.97.46-1.11a.5.5 0 0 1 .36-.17c.12 0 .24 0 .34.01.11 0 .26-.04.4.31.15.36.5 1.24.55 1.33.05.09.08.2.02.33-.06.13-.09.2-.18.31-.09.11-.19.25-.27.33-.09.09-.18.19-.08.37.1.18.44.73.95 1.18.65.58 1.2.76 1.38.85.18.09.29.07.4-.04.11-.12.46-.53.58-.71.12-.18.24-.15.4-.09.16.06 1.02.48 1.19.57.18.09.29.13.33.2.05.08.05.42-.19 1.1Z" />
    </svg>
  );
}

export function CustomersTable() {
  const [customers, setCustomers] = useState<TailorCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [previewCustomer, setPreviewCustomer] = useState<TailorCustomer | null>(null);
  const [customerPendingDelete, setCustomerPendingDelete] =
    useState<TailorCustomer | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { notice: deliveryNotice, dismiss: dismissDeliveryNotice } = useDeliveryNotice(customers);

  const refreshCustomers = () => {
    fetchCustomers()
      .then((records) => {
        setCustomers(records);
        setLoadError("");
      })
      .catch(() => {
        setCustomers([]);
        setLoadError("Unable to load customers. Please restart the app and try again.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    migrateLegacyLocalStorageCustomers().then(refreshCustomers);
  }, []);

  const groupedCustomers = useMemo(() => {
    const groups = new Map<string, CustomerGroup>();

    customers.forEach((customer) => {
      const key = customerKey(customer);
      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.orders.push(customer);
        return;
      }

      groups.set(key, {
        key,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        customerIdNumber: customer.customerIdNumber,
        notes: customer.notes,
        orders: [customer]
      });
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      orders: group.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }));
  }, [customers]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^id:\s*/, "");

    if (!query) {
      return groupedCustomers;
    }

    return groupedCustomers.filter((group) => {
      return (
        group.customerName.toLowerCase().includes(query) ||
        group.phoneNumber.toLowerCase().includes(query) ||
        group.customerIdNumber.toLowerCase().includes(query) ||
        group.orders.some((order) =>
          `${order.customerIdNumber} ${order.outfitType} ${order.suitDesign} ${order.fabricType}`
            .toLowerCase()
            .includes(query)
        )
      );
    });
  }, [groupedCustomers, search]);

  const renderOrderTable = (
    group: CustomerGroup,
    {
      title,
      description,
      tone = "default"
    }: {
      title: string;
      description: string;
      tone?: "default" | "complete";
    }
  ) => (
    <div className="mt-4 overflow-hidden rounded-lg border border-[#e1d6c4]">
      <div
        className={
          tone === "complete"
            ? "border-b border-emerald-200 bg-emerald-50 px-4 py-3"
            : "border-b border-[#e1d6c4] bg-[#fbfaf7] px-4 py-3"
        }
      >
        <h4
          className={
            tone === "complete"
              ? "text-sm font-black uppercase tracking-wide text-emerald-700"
              : "text-sm font-black uppercase tracking-wide text-[#0d6b5f]"
          }
        >
          {title}
        </h4>
        <p
          className={
            tone === "complete"
              ? "mt-1 text-sm text-emerald-700"
              : "mt-1 text-sm text-slate-500"
          }
        >
          {description}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-[#fbfaf7] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Order / outfit</th>
              <th className="px-4 py-3 font-semibold">Dates</th>
              <th className="px-4 py-3 font-semibold">Measurements</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {group.orders.map((order, index) => (
              <tr key={order.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="font-bold text-slate-950">
                    Order #{group.orders.length - index}
                  </div>
                  <div className="font-semibold text-slate-800">
                    {order.outfitType || "Normal suit"}
                  </div>
                  <div className="text-slate-500">
                    {order.fabricType || "Fabric not set"}
                  </div>
                  <span className="mt-2 inline-flex rounded-full bg-[#e8f4f0] px-3 py-1 text-xs font-bold text-[#005f52]">
                    {order.orderStatus}
                  </span>
                  <span
                    className={`ml-2 mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getCompletionLabel(order).className}`}
                  >
                    {getCompletionLabel(order).label}
                  </span>
                  {order.orderStatus === "Completed" ? (
                    <a
                      href={buildWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Message customer on WhatsApp"
                      aria-label="Message customer on WhatsApp"
                      className="ml-2 mt-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:bg-[#1fb855]"
                    >
                      <WhatsAppIcon />
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <div>Order: {formatDate(order.orderDate)}</div>
                  <div
                    className={
                      getDeliveryReminder(order)?.isCritical
                        ? "font-semibold text-red-600"
                        : ""
                    }
                  >
                    Delivery: {formatDate(order.deliveryDate)}
                  </div>
                  {getDeliveryReminder(order)?.isCritical ? (
                    <div className="mt-1 text-xs font-bold uppercase tracking-wide text-red-600">
                      {getDeliveryReminder(order)?.label}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <div>Type: {order.customerCategory || "Men"}</div>
                  <div>Length: {order.qameezLength || "-"} {order.measurementUnit ?? "inch"}</div>
                  <div>Chest: {order.chestWidth || "-"} {order.measurementUnit ?? "inch"}</div>
                  <div>Shoulder: {order.shoulder || "-"} {order.measurementUnit ?? "inch"}</div>
                  <div>Sleeve: {order.sleeveLength || "-"} {order.measurementUnit ?? "inch"}</div>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <div>Price: £{order.stitchingPrice || "0"}</div>
                  <div>Advance: £{order.advancePayment || "0"}</div>
                  <div>Remaining: £{order.remainingPayment || "0"}</div>
                  <div
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getCompletionLabel(order).className}`}
                  >
                    {getCompletionLabel(order).label}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/customers/order?id=${order.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                    {/* <button
                      type="button"
                      onClick={() => setPreviewCustomer(order)}
                      className="rounded-md border border-[#d8b05b] px-3 py-1.5 text-xs font-semibold text-[#7a5415] hover:bg-[#fff8e7]"
                    >
                      Preview
                    </button> */}
                    <Link
                      href={`/customers/${order.id}/print`}
                      className="rounded-md border border-[#0d6b5f] px-3 py-1.5 text-xs font-semibold text-[#0d6b5f] hover:bg-[#e8f4f0]"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/customers/${order.id}/invoice`}
                      className="rounded-md border border-[#1f3a5f] px-3 py-1.5 text-xs font-semibold text-[#1f3a5f] hover:bg-blue-50"
                    >
                      Invoice
                    </Link>
                    <Link
                      href={`/customers/${order.id}/label`}
                      className="rounded-md border border-[#7a5415] px-3 py-1.5 text-xs font-semibold text-[#7a5415] hover:bg-[#fff8e7]"
                    >
                      Label
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCustomerPendingDelete(order)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomerGroup = (group: CustomerGroup) => {
    const activeOrders = group.orders.filter((order) => !isOrderClosed(order));
    const closedOrders = group.orders.filter(isOrderClosed);

    return (
      <article key={group.key} className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">
              {group.customerName || "Unnamed customer"}
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>Phone: {group.phoneNumber || "-"}</span>
              <span>ID: {group.customerIdNumber || "-"}</span>
            </div>
            {group.notes ? (
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                {group.notes}
              </p>
            ) : null}
          </div>
          <Link
            href={`/customers/order?customerId=${group.orders[0].id}`}
            className="w-fit rounded-md bg-[#102f2d] px-4 py-2 text-sm font-bold text-white hover:bg-[#183936]"
          >
            Add order
          </Link>
        </div>

        {activeOrders.length > 0 ? (
          renderOrderTable(
            {
              ...group,
              orders: activeOrders
            },
            {
              title: "Active / pending orders",
              description: "Work or payment is still pending."
            }
          )
        ) : null}

        {closedOrders.length > 0 ? (
          renderOrderTable(
            {
              ...group,
              orders: closedOrders
            },
            {
              title: "Completed orders",
              description: "Delivered aur payment clear orders.",
              tone: "complete"
            }
          )
        ) : null}
      </article>
    );
  };

  const confirmDelete = () => {
    if (!customerPendingDelete) {
      return;
    }

    deleteCustomerRecord(customerPendingDelete.id)
      .then(() => {
        setCustomerPendingDelete(null);
        refreshCustomers();
      })
      .catch(() => {
        setLoadError("Unable to delete order. Please try again.");
      });
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 sm:px-8 lg:px-12">
      <DeliveryReminderToast notice={deliveryNotice} onDismiss={dismissDeliveryNotice} />
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-[#e1d6c4] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0d6b5f]">
              Customer profiles
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              Customers & orders
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage multiple suits, maxi, trouser, blouse, and other orders
              under one customer profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md border border-[#d8ccb9] bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-[#fbfaf7]"
            >
              Dashboard
            </Link>
            <Link
              href="/customers/order"
              className="rounded-md bg-[#005f52] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#064e45]"
            >
              Add new customer
            </Link>
          </div>
        </div>

        <section className="rounded-lg border border-[#e1d6c4] bg-white shadow-sm">
          {loadError ? (
            <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
              {loadError}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 border-b border-[#e1d6c4] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {filteredGroups.length} customers / {customers.length} orders
              </h2>
              <p className="text-sm text-slate-500">
                Customer profiles are never duplicated - orders are added within them.
              </p>
            </div>
            <input
              className="w-full rounded-md border border-[#d8ccb9] px-3 py-2 text-sm outline-none focus:border-[#0d6b5f] focus:ring-2 focus:ring-[#0d6b5f]/15 md:max-w-sm"
              placeholder="Search by name, phone, ID, outfit"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="divide-y divide-[#e1d6c4]">
            {isLoading ? (
              <LoadingState label="Loading customers..." />
            ) : filteredGroups.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500">
                No customer records found.
              </div>
            ) : (
              filteredGroups.map(renderCustomerGroup)
            )}
          </div>
        </section>
      </section>

      {/* {previewCustomer ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="print-hidden mb-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreviewCustomer(null);
                }}
                className="rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-[#fbfaf7]"
              >
                Close preview
              </button>
            </div>
            <MeasurementPreview customer={previewCustomer} compact />
          </div>
        </div>
      ) : null} */}

      {customerPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="dashboard-card w-full max-w-md overflow-hidden rounded-lg border border-[#e1d6c4] bg-white shadow-2xl">
            <div className="bg-[#122b2a] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#d8b05b]">
                Delete order
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Remove this order?
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-slate-600">
                This will delete only this order/measurement sheet. The
                customer&apos;s other orders will stay safe.
              </p>
              <div className="mt-4 rounded-lg border border-[#e1d6c4] bg-[#fbfaf7] p-4">
                <p className="font-bold text-slate-950">
                  {customerPendingDelete.customerName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {customerPendingDelete.outfitType || "Normal suit"}
                </p>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCustomerPendingDelete(null)}
                  className="rounded-md border border-[#d8ccb9] px-4 py-2 text-sm font-bold text-slate-800 hover:bg-[#fbfaf7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-800"
                >
                  Delete order
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
