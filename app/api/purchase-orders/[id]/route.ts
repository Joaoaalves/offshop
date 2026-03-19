import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchaseOrderRepository } from "@/repositories/purchase-order.repository";

const repo = new PurchaseOrderRepository();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();
  const { id } = await params;
  const { arrivedAt } = await req.json();

  const date = arrivedAt ? new Date(arrivedAt) : new Date();
  const updated = await repo.markArrived(id, date);

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
