import { requireIngestToken } from "@/lib/ingest-guard";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MlProductRepository } from "@/repositories/mercado-livre/ml-product.repository";
import { SalesRebuildOrchestrator } from "@/repositories/mercado-livre/SalesRebuildOrchestrator";

export async function POST(req: NextRequest) {
  const deny = await requireIngestToken(req);
  if (deny) return deny;

  await connectDB();
  const payload = await req.json();
  const repo = new MlProductRepository();

  await repo.upsertMany(payload);

  const salesOrch = new SalesRebuildOrchestrator();
  await salesOrch.rebuildAll();

  return NextResponse.json({ inserted: payload.length });
}
