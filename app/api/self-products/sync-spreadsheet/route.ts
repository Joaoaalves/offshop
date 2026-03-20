import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";

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
    const baseSku: string = item.baseSku?.trim();
    if (!baseSku) continue;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { baseSku: _, ...data } = item;

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
