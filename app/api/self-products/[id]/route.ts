import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { syncProductToSpreadsheet } from "@/services/spreadsheet-sync.service";
import { requirePermission } from "@/lib/auth-guard";

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
    // Fire-and-forget — does not block the response
    syncProductToSpreadsheet(updated.toObject()).catch(() => void 0);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("products:delete");
  if (deny) return deny;
  await connectDB();

  const { id } = await params;
  const repo = new SelfProductRepository();
  await repo.delete(id);

  return NextResponse.json({ success: true });
}
