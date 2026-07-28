import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { CustomerFormValues, TailorCustomer } from "@/types/customer";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "tailor-dashboard.db");

let database: Database.Database | null = null;

function getDatabase() {
  if (!database) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    database = new Database(databasePath);
    database.pragma("journal_mode = WAL");
    database
      .prepare(
        `CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          createdAt TEXT NOT NULL,
          data TEXT NOT NULL
        )`
      )
      .run();
  }

  return database;
}

function normalizeCustomer(row: { id: string; createdAt: string; data: string }) {
  const data = JSON.parse(row.data) as CustomerFormValues;

  return {
    ...data,
    id: row.id,
    createdAt: row.createdAt,
    customerCategory: data.customerCategory ?? "Men",
    outfitType: data.outfitType ?? "Normal suit",
    measurementUnit: data.measurementUnit ?? "inch"
  } satisfies TailorCustomer;
}

export function listCustomers() {
  const rows = getDatabase()
    .prepare("SELECT id, createdAt, data FROM customers ORDER BY createdAt DESC")
    .all() as Array<{ id: string; createdAt: string; data: string }>;

  return rows.map(normalizeCustomer);
}

export function getCustomerById(id: string) {
  const row = getDatabase()
    .prepare("SELECT id, createdAt, data FROM customers WHERE id = ?")
    .get(id) as { id: string; createdAt: string; data: string } | undefined;

  return row ? normalizeCustomer(row) : null;
}

export function saveCustomer(values: CustomerFormValues, id?: string) {
  const existingCustomer = id ? getCustomerById(id) : null;
  const customerId = existingCustomer?.id ?? crypto.randomUUID();
  const createdAt = existingCustomer?.createdAt ?? new Date().toISOString();

  getDatabase()
    .prepare(
      `INSERT INTO customers (id, createdAt, data)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`
    )
    .run(customerId, createdAt, JSON.stringify(values));

  return {
    ...values,
    id: customerId,
    createdAt
  } satisfies TailorCustomer;
}

export function removeCustomer(id: string) {
  getDatabase().prepare("DELETE FROM customers WHERE id = ?").run(id);
}
