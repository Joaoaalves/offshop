import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MlProductRepository } from "@/repositories/mercado-livre/ml-product.repository";
import { SalesRebuildOrchestrator } from "@/repositories/mercado-livre/SalesRebuildOrchestrator";

interface Deposit {
  name: string;
  ignore: boolean;
  balance: number;
}

interface FlexStockLine {
  sku: string;
  deposits: Deposit[];
}

export async function POST(req: Request) {
  await connectDB();

  const payload: FlexStockLine[] = await req.json();

  const stockUpdates = payload.map((line) => ({
    sku: line.sku,
    availableQuantity:
      line.deposits.find((d) => d.name === "Galpão" && !d.ignore)?.balance ?? 0,
  }));

  const repo = new MlProductRepository();
  await repo.updateFlexStock(stockUpdates);

  const salesOrch = new SalesRebuildOrchestrator();
  await salesOrch.rebuildAll();

  return NextResponse.json({ updated: stockUpdates.length });
}
