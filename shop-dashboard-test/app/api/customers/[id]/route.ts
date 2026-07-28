import { NextResponse } from "next/server";
import {
  getCustomerById,
  removeCustomer,
  saveCustomer
} from "@/lib/customerDatabase";
import type { CustomerFormValues } from "@/types/customer";

export const runtime = "nodejs";

export function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const customer = getCustomerById(params.id);

  if (!customer) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as CustomerFormValues;
  const customer = saveCustomer(body, params.id);

  return NextResponse.json(customer);
}

export function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  removeCustomer(params.id);

  return NextResponse.json({ ok: true });
}
