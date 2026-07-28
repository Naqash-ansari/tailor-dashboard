import type { CustomerFormValues, TailorCustomer } from "@/types/customer";

const LEGACY_STORAGE_KEY = "tailor-dashboard-customers";
const MIGRATION_FLAG_KEY = "tailor-dashboard-sqlite-migrated";

export async function fetchCustomers() {
  const response = await fetch("/api/customers", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load customers");
  }

  return (await response.json()) as TailorCustomer[];
}

export async function fetchCustomer(id: string) {
  const response = await fetch(`/api/customers/${id}`, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as TailorCustomer;
}

export async function saveCustomerRecord(values: CustomerFormValues, id?: string) {
  const response = await fetch(id ? `/api/customers/${id}` : "/api/customers", {
    method: id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    throw new Error("Unable to save customer");
  }

  return (await response.json()) as TailorCustomer;
}

export async function deleteCustomerRecord(id: string) {
  const response = await fetch(`/api/customers/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Unable to delete customer");
  }
}

export async function migrateLegacyLocalStorageCustomers() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.localStorage.getItem(MIGRATION_FLAG_KEY)) {
    return;
  }

  const rawCustomers = window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!rawCustomers) {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
    return;
  }

  try {
    const customers = JSON.parse(rawCustomers) as TailorCustomer[];

    if (!Array.isArray(customers)) {
      window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
      return;
    }

    await Promise.all(
      customers.map((customer) => {
        const { id, createdAt: _createdAt, ...values } = customer;
        return saveCustomerRecord(
          {
            ...values,
            customerCategory: values.customerCategory ?? "Men",
            outfitType: values.outfitType ?? "Normal suit",
            measurementUnit: values.measurementUnit ?? "inch"
          },
          id
        );
      })
    );

    window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
  } catch {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
  }
}
