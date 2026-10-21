import { NextResponse } from "next/server";
import {
  addGarmentOption,
  listGarmentOptions,
  removeGarmentOption
} from "@/lib/customerDatabase";
import { cleanGarmentValue, isGarmentKind } from "@/lib/garmentOptions";

export const runtime = "nodejs";

async function readOptionBody(request: Request) {
  const body = (await request.json().catch(() => null)) as { kind?: unknown; value?: unknown } | null;
  const value = typeof body?.value === "string" ? cleanGarmentValue(body.value) : "";

  if (!isGarmentKind(body?.kind) || !value) {
    return null;
  }

  return { kind: body.kind, value };
}

export function GET() {
  return NextResponse.json(listGarmentOptions());
}

export async function POST(request: Request) {
  const option = await readOptionBody(request);

  if (!option) {
    return NextResponse.json({ message: "Invalid garment option" }, { status: 400 });
  }

  const result = addGarmentOption(option.kind, option.value);

  return NextResponse.json(result, { status: result.status === "added" ? 201 : 200 });
}

export async function DELETE(request: Request) {
  const option = await readOptionBody(request);

  if (!option) {
    return NextResponse.json({ message: "Invalid garment option" }, { status: 400 });
  }

  removeGarmentOption(option.kind, option.value);

  return NextResponse.json({ ok: true });
}
