import { z } from "zod";
import { supplierPrefixFromSku } from "@/lib/sku-prefix";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { SupplierRepository } from "@/repositories/supplier.repository";

// ─── Tiny schema ─────────────────────────────────────────────────────────────

const tinyProductSchema = z.object({
  id:                   z.union([z.string(), z.number()]).transform(String),
  codigo:               z.string().min(1),
  nome:                 z.string().min(1),
  ncm:                  z.string().optional().default(""),
  preco:                z.coerce.number().optional(),
  valor_ipi_fixo:       z.coerce.number().optional(),
  peso_liquido:         z.coerce.number().optional(),
  peso_bruto:           z.coerce.number().optional(),
  alturaEmbalagem:      z.coerce.number().optional(),
  comprimentoEmbalagem: z.coerce.number().optional(),
  larguraEmbalagem:     z.coerce.number().optional(),
  unidade_por_caixa:    z.coerce.number().optional(),
  estoque_minimo:       z.coerce.number().optional(),
  nome_fornecedor:      z.string().optional(),
  marca:                z.string().optional(),
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

export type TinyBody = z.infer<typeof tinyBodySchema>;
export type TinyProduct = z.infer<typeof tinyProductSchema>;

// ─── Validation ───────────────────────────────────────────────────────────────

export function parseTinyBodies(raw: unknown): {
  items: TinyProduct[];
  errors: { index: number; details: z.ZodFormattedError<TinyProduct> }[];
} {
  const payloads = Array.isArray(raw) ? raw : [raw];
  const items: TinyProduct[] = [];
  const errors: { index: number; details: z.ZodFormattedError<TinyProduct> }[] = [];

  for (let i = 0; i < payloads.length; i++) {
    // Webhook format: { retorno: { status: "OK", produto: {...} } }
    const webhook = tinyBodySchema.safeParse(payloads[i]);
    if (webhook.success) {
      items.push(webhook.data.retorno.produto);
      continue;
    }

    // JSONL / raw product format: { id, nome, codigo, ... }
    const raw = tinyProductSchema.safeParse(payloads[i]);
    if (raw.success) {
      items.push(raw.data);
      continue;
    }

    errors.push({ index: i, details: raw.error.format() });
  }

  return { items, errors };
}

// ─── Service ─────────────────────────────────────────────────────────────────

function ncmClean(raw: string): string {
  return raw.replace(/[.\s]/g, "");
}

export class SelfProductIngestService {
  private readonly products = new SelfProductRepository();
  private readonly suppliers = new SupplierRepository();

  private async resolveSupplier(
    sku: string,
    nomeFornecedor?: string,
    marca?: string,
  ): Promise<string | undefined> {
    const prefix = supplierPrefixFromSku(sku).toUpperCase();

    const byPrefix = await this.suppliers.findByPrefix(prefix);
    if (byPrefix) return (byPrefix as any)._id.toString();

    for (const name of [nomeFornecedor, marca]) {
      if (name?.trim()) {
        const byName = await this.suppliers.findByNamePartial(name.trim());
        if (byName) return (byName as any)._id.toString();
      }
    }

    return undefined;
  }

  private async buildDoc(p: TinyProduct): Promise<Record<string, unknown>> {
    const supplierId = await this.resolveSupplier(p.codigo, p.nome_fornecedor, p.marca);

    const raw: Record<string, unknown> = {
      productType:        "simples",
      baseSku:            p.codigo,
      name:               p.nome,
      ncm:                p.ncm ? ncmClean(p.ncm) : undefined,
      tablePrice:         p.preco,
      ipi:                p.valor_ipi_fixo,
      weightKg:           p.peso_liquido,
      chargeableWeightKg: p.peso_bruto,
      heightCm:           p.alturaEmbalagem      || undefined,
      lengthCm:           p.comprimentoEmbalagem || undefined,
      widthCm:            p.larguraEmbalagem     || undefined,
      unitsPerBox:        p.unidade_por_caixa    || undefined,
      imageUrl:           p.anexos[0]?.anexo     ?? undefined,
      supplier:           supplierId,
    };

    // Strip undefined so existing fields aren't nulled on update
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
  }

  async ingestOne(p: TinyProduct) {
    const doc = await this.buildDoc(p);
    const saved = await this.products.upsertBySku(p.codigo, doc);
    return { baseSku: p.codigo, supplierId: (doc.supplier as string) ?? null, _id: (saved as any)?._id };
  }

  async ingestMany(items: TinyProduct[]) {
    const results = await Promise.allSettled(items.map((p) => this.ingestOne(p)));

    const fulfilled = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof this.ingestOne>>> => r.status === "fulfilled")
      .map((r) => r.value);

    const failed = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r, i) => ({ index: i, reason: String(r.reason) }));

    return { fulfilled, failed };
  }
}
