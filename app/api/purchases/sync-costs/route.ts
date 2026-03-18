import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";

export async function POST() {
  await connectDB();
  const repo = new PurchasesRepository();
  const results = await repo.syncCosts();
  return NextResponse.json(results);
}
