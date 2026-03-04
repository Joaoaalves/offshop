import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";

export async function GET() {
  await connectDB();
  const repo = new SelfProductRepository();
  return NextResponse.json(await repo.findAll());
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  const repo = new SelfProductRepository();
  const product = await repo.create(data);
  return NextResponse.json(product);
}
