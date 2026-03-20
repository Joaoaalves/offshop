import { connectDB } from "@/lib/db";
import { SupplierRepository } from "@/repositories/supplier.repository";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-guard";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("suppliers:write");
  if (deny) return deny;
  await connectDB();
  const data = await req.json();
  const { id } = await params;

  const repo = new SupplierRepository();

  const updated = await repo.update(id, data);

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("suppliers:write");
  if (deny) return deny;
  await connectDB();
  const { id } = await params;

  const repo = new SupplierRepository();

  await repo.delete(id);
  return NextResponse.json({ success: true });
}
