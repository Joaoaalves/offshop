import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";

export async function GET() {
  await connectDB();
  const repo = new PurchasesRepository();
  const items = await repo.getAll();
  return NextResponse.json(items);
}

export async function POST() {
  await connectDB();
  const repo = new PurchasesRepository();
  await repo.rebuild();
  return NextResponse.json({ ok: true });
}
