import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";
import { requirePermission } from "@/lib/auth-guard";

export async function POST() {
  const deny = await requirePermission("finance:write");
  if (deny) return deny;
  await connectDB();
  const repo = new PurchasesRepository();
  const results = await repo.syncCosts();
  return NextResponse.json(results);
}
