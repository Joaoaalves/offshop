import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SupplierRepository } from "@/repositories/supplier.repository";

export async function GET() {
  await connectDB();
  const repo = new SupplierRepository();
  return NextResponse.json(await repo.findAllWithProductCount());
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  const repo = new SupplierRepository();
  const supplier = await repo.create(data);
  return NextResponse.json(supplier);
}
