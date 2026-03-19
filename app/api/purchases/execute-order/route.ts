import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchaseOrderRepository } from "@/repositories/purchase-order.repository";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";
import { IPurchaseOrderItem } from "@/types/purchase-order";

const orderRepo = new PurchaseOrderRepository();
const purchasesRepo = new PurchasesRepository();

export async function POST(req: NextRequest) {
  await connectDB();

  const { supplierName, items } = (await req.json()) as {
    supplierName: string;
    items: IPurchaseOrderItem[];
  };

  if (!supplierName || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // 1. Persist the purchase order record
  const order = await orderRepo.create(supplierName, items);

  // 2. Increment stock.incoming + clear `order` field from dashboard
  await purchasesRepo.executeOrders(
    items.map(({ baseSku, quantity }) => ({ baseSku, quantity })),
  );

  // 3. Rebuild the purchases dashboard so incoming stock is reflected
  await purchasesRepo.rebuild();

  return NextResponse.json({ orderId: order._id }, { status: 201 });
}
