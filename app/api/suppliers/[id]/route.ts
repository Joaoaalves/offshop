import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SupplierRepository } from "@/repositories/supplier.repository";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("suppliers:write");
  if (deny) return deny;
  await connectDB();
  const data = await req.json();
  const { id } = await params;
  const repo = new SupplierRepository();
  const updated = await repo.update(id, data);
  logAction(req, "suppliers:write", { id });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("suppliers:write");
  if (deny) return deny;
  await connectDB();
  const { id } = await params;
  const repo = new SupplierRepository();
  await repo.delete(id);
  logAction(req, "suppliers:delete", { id });
  return NextResponse.json({ success: true });
}
