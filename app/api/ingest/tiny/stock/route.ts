import { requireIngestToken } from "@/lib/ingest-guard";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { SalesRebuildOrchestrator } from "@/repositories/mercado-livre/SalesRebuildOrchestrator";
import { PurchasesRepository } from "@/repositories/purchases/purchases.repository";
import { MlProduct } from "@/models/mercado-livre/MlProduct";

interface Deposit {
  name: string;
  ignore: boolean;
  balance: number;
}

interface FlexStockLine {
  sku: string;
  deposits: Deposit[];
}

export async function POST(req: NextRequest) {
  const deny = await requireIngestToken(req);
  if (deny) return deny;

  await connectDB();
  const payload: FlexStockLine[] = await req.json();

  // Build fulfillment map from MlProduct.stock.full (more reliable than Tiny deposits).
  // Sum all ML listings whose sku contains the baseSku (covers kit prefixes like 5U-SKU).
  const mlProducts = await MlProduct.find(
    { sku: { $exists: true } },
    { sku: 1, "stock.full": 1, unitsPerPack: 1 },
  ).lean();

  // For a given baseSku, sum (stock.full × unitsPerPack) across all ML listings
  // whose sku contains baseSku — e.g. "5U-SKU" with unitsPerPack=5 and full=10 → 50 units
  function getFulfillment(baseSku: string): number {
    let total = 0;
    for (const ml of mlProducts) {
      if (!ml.sku?.includes(baseSku)) continue;
      const units = (ml.stock?.full ?? 0) * (ml.unitsPerPack ?? 1);
      total += units;
    }
    return total;
  }

  const lines = payload.map((line) => ({
    sku: line.sku,
    storage:
      line.deposits.find((d) => d.name === "Galpão" && !d.ignore)?.balance ?? 0,
    incoming:
      line.deposits.find((d) => d.name === "A Caminho" && !d.ignore)?.balance ?? 0,
    damage:
      line.deposits.find((d) => d.name === "Avaria" && !d.ignore)?.balance ?? 0,
    fulfillment: getFulfillment(line.sku),
  }));

  const repo = new SelfProductRepository();
  await repo.updateStock(lines);
  const salesOrch = new SalesRebuildOrchestrator();
  await salesOrch.rebuildAll();
  const puchaseRepo = new PurchasesRepository();
  await puchaseRepo.rebuild();
  return NextResponse.json({ updated: lines.length });
}
