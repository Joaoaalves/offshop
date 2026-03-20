import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";
import { requirePermission } from "@/lib/auth-guard";

export async function GET() {
  const deny = await requirePermission("purchases:read");
  if (deny) return deny;
  await connectDB();
  const repo = new PurchasesRepository();
  const items = await repo.getAll();
  return NextResponse.json(items);
}

export async function POST() {
  const deny = await requirePermission("ingest:run");
  if (deny) return deny;
  await connectDB();
  const repo = new PurchasesRepository();
  await repo.rebuild();
  return NextResponse.json({ ok: true });
}
