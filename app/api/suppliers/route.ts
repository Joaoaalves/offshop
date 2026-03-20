import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SupplierRepository } from "@/repositories/supplier.repository";
import { requirePermission } from "@/lib/auth-guard";

export async function GET() {
  const deny = await requirePermission("suppliers:read");
  if (deny) return deny;
  await connectDB();
  const repo = new SupplierRepository();
  return NextResponse.json(await repo.findAllWithProductCount());
}

export async function POST(req: Request) {
  const deny = await requirePermission("suppliers:write");
  if (deny) return deny;
  await connectDB();
  const data = await req.json();
  const repo = new SupplierRepository();
  const supplier = await repo.create(data);
  return NextResponse.json(supplier);
}
