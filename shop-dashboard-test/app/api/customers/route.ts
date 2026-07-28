import { NextResponse } from "next/server";
import { listCustomers, saveCustomer } from "@/lib/customerDatabase";
import type { CustomerFormValues } from "@/types/customer";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(listCustomers());
}

export async function POST(request: Request) {
  const body = (await request.json()) as CustomerFormValues;
  const customer = saveCustomer(body);

  return NextResponse.json(customer, { status: 201 });
}
