import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchaseOrderRepository } from "@/repositories/purchase-order.repository";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";
import { syncArrivalToTinyStock } from "@/services/tiny-stock-sync.service";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

const repo = new PurchaseOrderRepository();
const purchasesRepo = new PurchasesRepository();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("orders:write");
  if (deny) return deny;
  await connectDB();
  const { id } = await params;
  const { arrivedAt } = await req.json();

  const date = arrivedAt ? new Date(arrivedAt) : new Date();
  const updated = await repo.markArrived(id, date);

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Transfer stock A caminho → Galpão in Tiny ERP (fire-and-forget)
  syncArrivalToTinyStock(
    updated.items.map((i) => ({ baseSku: i.baseSku, quantity: i.quantity })),
  ).catch(() => void 0);

  // Rebuild dashboard in the background so stock changes are reflected
  purchasesRepo.rebuild().catch(() => void 0);

  logAction(req, "orders:write", { id, arrivedAt: date.toISOString() });
  return NextResponse.json(updated);
}
