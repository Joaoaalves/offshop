/**
 * POST /api/ingest/self-product
 *
 * Accepts a Tiny ERP product webhook payload and upserts it into the
 * SelfProduct collection.  The supplier is resolved via the SKU prefix.
 *
 * Expected body (Tiny format):
 *   { "retorno": { "status": "OK", "produto": { ... } } }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { SelfProduct } from "@/models/SelfProduct";
import { Supplier } from "@/models/Supplier";
import { supplierPrefixFromSku } from "@/lib/sku-prefix";

// ─── Tiny schema ─────────────────────────────────────────────────────────────

const tinyProductSchema = z.object({
  id:                  z.union([z.string(), z.number()]).transform(String),
  codigo:              z.string().min(1),
  nome:                z.string().min(1),
  ncm:                 z.string().optional().default(""),
  preco:               z.coerce.number().optional(),
  valor_ipi_fixo:      z.coerce.number().optional(),
  peso_liquido:        z.coerce.number().optional(),
  peso_bruto:          z.coerce.number().optional(),
  alturaEmbalagem:     z.coerce.number().optional(),
  comprimentoEmbalagem: z.coerce.number().optional(),
  larguraEmbalagem:    z.coerce.number().optional(),
  unidade_por_caixa:   z.coerce.number().optional(),
  estoque_minimo:      z.coerce.number().optional(),
  nome_fornecedor:     z.string().optional(),
  anexos: z
    .array(z.object({ anexo: z.string().url() }))
    .optional()
    .default([]),
});

const tinyBodySchema = z.object({
  retorno: z.object({
    status: z.literal("OK"),
    produto: tinyProductSchema,
  }),
});

// ─── Field mapping ────────────────────────────────────────────────────────────

function ncmClean(raw: string): string {
  // "9503.00.80" → "95030080"
  return raw.replace(/[.\s]/g, "");
}

async function resolveSupplier(
  sku: string,
  nomeFornecedor?: string,
): Promise<string | undefined> {
  const prefix = supplierPrefixFromSku(sku).toUpperCase();

  // Try by SKU prefix first
  const byPrefix = await Supplier.findOne({ prefix }).lean();
  if (byPrefix) return (byPrefix as any)._id.toString();

  // Fallback: try by supplier name (partial, case-insensitive)
  if (nomeFornecedor) {
    const byName = await Supplier.findOne({
      name: { $regex: nomeFornecedor.slice(0, 20), $options: "i" },
    }).lean();
    if (byName) return (byName as any)._id.toString();
  }

  return undefined;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = tinyBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Tiny payload.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const p = parsed.data.retorno.produto;

  await connectDB();

  const supplierId = await resolveSupplier(p.codigo, p.nome_fornecedor);

  // Tiny dimensions are in cm already
  const doc: Record<string, any> = {
    productType:  "simples",
    baseSku:      p.codigo,
    name:         p.nome,
    ncm:          p.ncm ? ncmClean(p.ncm) : undefined,
    tablePrice:   p.preco,
    ipi:          p.valor_ipi_fixo,
    weightKg:     p.peso_liquido,
    chargeableWeightKg: p.peso_bruto,
    heightCm:     p.alturaEmbalagem   || undefined,
    lengthCm:     p.comprimentoEmbalagem || undefined,
    widthCm:      p.larguraEmbalagem  || undefined,
    unitsPerBox:  p.unidade_por_caixa || undefined,
    imageUrl:     p.anexos[0]?.anexo  ?? undefined,
    supplier:     supplierId,
  };

  // Strip undefined values so existing fields aren't nulled out on update
  const update = Object.fromEntries(
    Object.entries(doc).filter(([, v]) => v !== undefined),
  );

  await SelfProduct.findOneAndUpdate(
    { baseSku: p.codigo },
    { $set: update },
    { upsert: true, new: true },
  );

  return NextResponse.json({ ok: true, baseSku: p.codigo, supplierId: supplierId ?? null });
}
