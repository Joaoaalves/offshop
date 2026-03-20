import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { PurchaseDashboard } from "@/models/PurchaseDashboard";
import { syncProductToSpreadsheet } from "@/services/spreadsheet-sync.service";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("products:write");
  if (deny) return deny;
  await connectDB();

  const { id } = await params;
  const data = await req.json();

  const repo = new SelfProductRepository();
  const updated = await repo.update(id, data);

  if (updated) {
    syncProductToSpreadsheet(updated.toObject()).catch(() => void 0);
  }
  logAction(req, "products:write", { id });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("products:delete");
  if (deny) return deny;
  await connectDB();

  const { id } = await params;
  const repo = new SelfProductRepository();
  const deleted = await repo.delete(id);
  if (deleted?.baseSku) {
    await PurchaseDashboard.deleteOne({ baseSku: deleted.baseSku });
  }
  logAction(req, "products:delete", { id });

  return NextResponse.json({ success: true });
}
