import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { SupplierResolutionService } from "@/services/supplier-resolution.service";
import { importRowSchema } from "@/lib/self-product-schema";
import { z } from "zod";

const bulkSchema = z.array(importRowSchema);

export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an array." }, { status: 400 });
  }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 },
    );
  }

  await connectDB();

  const resolver = new SupplierResolutionService();
  const enriched = await Promise.all(
    parsed.data.map(async ({ supplierName, supplierId, ...rest }) => {
      const resolvedId =
        supplierId ?? (await resolver.resolve(rest.baseSku, supplierName));
      return resolvedId ? { ...rest, supplierId: resolvedId } : rest;
    }),
  );

  const repo = new SelfProductRepository();
  const result = await repo.bulkCreate(enriched);
  return NextResponse.json({ imported: result.length });
}
