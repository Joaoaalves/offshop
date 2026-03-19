import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchaseOrderRepository } from "@/repositories/purchase-order.repository";

const repo = new PurchaseOrderRepository();

export async function GET() {
  await connectDB();
  const orders = await repo.getAll();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { supplierName, items } = await req.json();
  const order = await repo.create(supplierName, items);
  return NextResponse.json(order, { status: 201 });
}
