import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Supplier } from "@/models/Supplier";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { selfProductSchema } from "@/lib/self-product-schema";
import { supplierPrefixFromSku } from "@/lib/sku-prefix";
import { z } from "zod";

const bulkSchema = z.array(selfProductSchema);

export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an array." }, { status: 400 });
  }

  await connectDB();

  // ── Resolve suppliers by SKU prefix ──────────────────────────────────────
  const prefixes = [
    ...new Set(
      body
        .map((p: any) => supplierPrefixFromSku(p.baseSku ?? "").toUpperCase())
        .filter(Boolean),
    ),
  ];

  const supplierDocs = await Supplier.find(
    prefixes.length ? { prefix: { $in: prefixes } } : {},
  ).lean();

  const supplierByPrefix = Object.fromEntries(
    supplierDocs
      .filter((s: any) => s.prefix)
      .map((s: any) => [s.prefix.toUpperCase(), s._id.toString()]),
  );

  // Enrich each product with the resolved supplierId (won't override if
  // the caller already supplied one explicitly).
  const enriched = body.map((p: any) => {
    if (p.supplierId) return p;
    const prefix = supplierPrefixFromSku(p.baseSku ?? "").toUpperCase();
    const supplierId = supplierByPrefix[prefix];
    return supplierId ? { ...p, supplierId } : p;
  });

  // ── Validate ──────────────────────────────────────────────────────────────
  const parsed = bulkSchema.safeParse(enriched);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  const repo = new SelfProductRepository();
  const result = await repo.bulkCreate(parsed.data);

  return NextResponse.json({ imported: result.length });
}
