import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MlProductRepository } from "@/repositories/mercado-livre/ml-product.repository";

export async function POST(req: Request) {
  await connectDB();
  const payload = await req.json();
  const repo = new MlProductRepository();

  await repo.insertManyViews(payload);

  return NextResponse.json({ inserted: payload.length });
}
