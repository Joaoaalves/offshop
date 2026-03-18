import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ baseSku: string }> },
) {
  await connectDB();
  const { baseSku } = await params;
  const body = await req.json();

  const allowed = ["classification", "order", "newCost"] as const;
  const field = allowed.find((f) => f in body);

  if (!field) {
    return NextResponse.json({ error: "Campo inválido." }, { status: 400 });
  }

  const repo = new PurchasesRepository();
  const updated = await repo.updateEditableField(baseSku, field, body[field]);

  return NextResponse.json(updated);
}
