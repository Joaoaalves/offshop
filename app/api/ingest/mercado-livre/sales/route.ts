import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SaleBucketRepository } from "@/repositories/mercado-livre/sale-bucket.repository";

export async function POST(req: Request) {
  await connectDB();

  const payload = await req.json();
  const repo = new SaleBucketRepository();

  await repo.upsertMany(payload);

  return NextResponse.json({ inserted: payload.length });
}
