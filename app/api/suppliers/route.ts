import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SupplierRepository } from "@/repositories/supplier.repository";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function GET() {
  const deny = await requirePermission("suppliers:read");
  if (deny) return deny;
  await connectDB();
  const repo = new SupplierRepository();
  return NextResponse.json(await repo.findAllWithProductCount());
}

export async function POST(req: NextRequest) {
  const deny = await requirePermission("suppliers:write");
  if (deny) return deny;
  await connectDB();
  const data = await req.json();
  const repo = new SupplierRepository();
  const supplier = await repo.create(data);
  logAction(req, "suppliers:write", { id: String(supplier._id), name: data.name });
  return NextResponse.json(supplier);
}
