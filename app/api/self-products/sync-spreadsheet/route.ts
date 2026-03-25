import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";

// Only numeric fields are synced from the spreadsheet.
// String fields like name, baseSku, manufacturerCode, ncm are never overwritten.
const ALLOWED_FIELDS = new Set([
  "cost",
  "icms",
  "ipi",
  "difal",
  "storageCost",
  "ncm",
  "manufacturerCode",
  "unitsPerBox",
  "widthCm",
  "heightCm",
  "lengthCm",
  "weightKg",
  "chargeableWeightKg",
  "volumeM3",
  "minStockDays",
  "kitQuantity",
]);

function calcPriceWithTaxes(item: Record<string, unknown>): number | undefined {
  const cost = Number(item.cost);
  const units = Number(item.unitsPerBox) || 1;
  if (!cost) return undefined;
  const icms = Number(item.icms) || 0;
  const ipi = Number(item.ipi) || 0;
  const difal = Number(item.difal) || 0;
  const storageCost = Number(item.storageCost) || 0;
  return (cost / units) * (1 + (icms + ipi + difal) / 100) + storageCost;
}

export async function POST() {
  const url = process.env.SPREADSHEET_URL;
  if (!url) {
    return NextResponse.json(
      { error: "SPREADSHEET_URL not configured" },
      { status: 500 },
    );
  }

  // 1. Fetch all rows from the spreadsheet
  const sheetRes = await fetch(url, { method: "GET" });
  if (!sheetRes.ok) {
    return NextResponse.json(
      { error: `Spreadsheet returned ${sheetRes.status}` },
      { status: 502 },
    );
  }

  const { products, error: sheetError } = await sheetRes.json();
  if (sheetError) {
    return NextResponse.json({ error: sheetError }, { status: 502 });
  }
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ updated: 0, notFound: [], errors: [] });
  }

  // 2. Update products in the database
  await connectDB();
  const repo = new SelfProductRepository();

  const results = {
    updated: 0,
    notFound: [] as string[],
    errors: [] as { baseSku: string; error: string }[],
  };

  for (const item of products) {
    if (item.baseSku === "BRG-ASSEN-BN-RGD") console.log(item);
    const baseSku: string = item.baseSku?.trim();
    if (!baseSku) continue;

    const data = Object.fromEntries(
      Object.entries(item).filter(([k]) => ALLOWED_FIELDS.has(k)),
    );

    const priceWithTaxes = calcPriceWithTaxes(item);
    if (priceWithTaxes != null) data.priceWithTaxes = priceWithTaxes;

    try {
      const updated = await repo.updateBySku(baseSku, data);
      if (!updated) results.notFound.push(baseSku);
      else results.updated++;
    } catch (e: unknown) {
      results.errors.push({
        baseSku,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json(results);
}
