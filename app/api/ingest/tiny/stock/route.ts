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
    { sku: 1, "stock.full": 1 },
  ).lean();

  const fulfillmentByBaseSku = new Map<string, number>();
  for (const ml of mlProducts) {
    if (!ml.sku) continue;
    const key = ml.sku;
    fulfillmentByBaseSku.set(key, (fulfillmentByBaseSku.get(key) ?? 0) + (ml.stock?.full ?? 0));
  }

  // For a given baseSku, sum stock.full from all ML listings that contain it
  function getFulfillment(baseSku: string): number {
    let total = 0;
    for (const [mlSku, qty] of fulfillmentByBaseSku) {
      if (mlSku.includes(baseSku)) total += qty;
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
