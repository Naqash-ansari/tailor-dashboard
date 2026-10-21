import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import {
  cleanGarmentValue,
  defaultGarmentOptions,
  normalizeGarmentValue,
  type GarmentKind,
  type GarmentOptions
} from "@/lib/garmentOptions";
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
    setUpGarmentOptions(database);
    setUpInvoiceNumbers(database);
  }

  return database;
}

function setUpInvoiceNumbers(db: Database.Database) {
  db.prepare("CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)").run();

  // Orders saved before invoice numbers existed get one now, oldest order first.
  const rows = db
    .prepare("SELECT id, data FROM customers ORDER BY createdAt, rowid")
    .all() as Array<{ id: string; data: string }>;
  const update = db.prepare("UPDATE customers SET data = ? WHERE id = ?");

  db.transaction(() => {
    for (const row of rows) {
      const data = JSON.parse(row.data) as CustomerFormValues;

      if (!data.invoiceNumber) {
        data.invoiceNumber = takeNextInvoiceNumber(db);
        update.run(JSON.stringify(data), row.id);
      }
    }
  })();
}

// Numbers come from a stored counter, so deleting an order never causes a number to be reused.
function takeNextInvoiceNumber(db: Database.Database) {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'lastInvoiceNumber'").get() as
    | { value: string }
    | undefined;
  const next = (row ? Number(row.value) : 0) + 1;

  db.prepare(
    `INSERT INTO app_meta (key, value) VALUES ('lastInvoiceNumber', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(String(next));

  return `INV-${String(next).padStart(4, "0")}`;
}

function setUpGarmentOptions(db: Database.Database) {
  const tableExists = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'garment_options'")
    .get();

  if (tableExists) {
    return;
  }

  db.prepare(
    `CREATE TABLE garment_options (
      kind TEXT NOT NULL,
      value TEXT NOT NULL,
      normalized TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (kind, normalized)
    )`
  ).run();

  // Seed the built-in options only once, so options the user deletes stay deleted.
  const insert = db.prepare(
    "INSERT OR IGNORE INTO garment_options (kind, value, normalized, createdAt) VALUES (?, ?, ?, ?)"
  );
  const createdAt = new Date().toISOString();

  db.transaction(() => {
    for (const kind of ["upper", "lower"] as const) {
      for (const value of defaultGarmentOptions[kind]) {
        insert.run(kind, value, normalizeGarmentValue(value), createdAt);
      }
    }
  })();
}

export function listGarmentOptions(): GarmentOptions {
  const rows = getDatabase()
    .prepare("SELECT kind, value FROM garment_options ORDER BY rowid")
    .all() as Array<{ kind: GarmentKind; value: string }>;

  const options: GarmentOptions = { upper: [], lower: [] };

  for (const row of rows) {
    options[row.kind]?.push(row.value);
  }

  return options;
}

export function addGarmentOption(kind: GarmentKind, rawValue: string) {
  const value = cleanGarmentValue(rawValue);
  const normalized = normalizeGarmentValue(value);
  const db = getDatabase();

  const existing = db
    .prepare("SELECT value FROM garment_options WHERE kind = ? AND normalized = ?")
    .get(kind, normalized) as { value: string } | undefined;

  if (existing) {
    return { status: "exists" as const, value: existing.value };
  }

  db.prepare(
    "INSERT OR IGNORE INTO garment_options (kind, value, normalized, createdAt) VALUES (?, ?, ?, ?)"
  ).run(kind, value, normalized, new Date().toISOString());

  return { status: "added" as const, value };
}

export function removeGarmentOption(kind: GarmentKind, value: string) {
  getDatabase()
    .prepare("DELETE FROM garment_options WHERE kind = ? AND normalized = ?")
    .run(kind, normalizeGarmentValue(value));
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
  const db = getDatabase();
  const existingCustomer = id ? getCustomerById(id) : null;
  const customerId = existingCustomer?.id ?? crypto.randomUUID();
  const createdAt = existingCustomer?.createdAt ?? new Date().toISOString();

  // The invoice number is owned by the server: keep the existing one, never take it from the client.
  const record = db.transaction(() => {
    const data: CustomerFormValues = {
      ...values,
      invoiceNumber: existingCustomer?.invoiceNumber || takeNextInvoiceNumber(db)
    };

    db.prepare(
      `INSERT INTO customers (id, createdAt, data)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`
    ).run(customerId, createdAt, JSON.stringify(data));

    return data;
  })();

  return {
    ...record,
    id: customerId,
    createdAt
  } satisfies TailorCustomer;
}

export function removeCustomer(id: string) {
  getDatabase().prepare("DELETE FROM customers WHERE id = ?").run(id);
}
