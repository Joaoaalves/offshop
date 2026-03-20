import { NextResponse } from "next/server";
import { TinyClient, TinyPlan } from "tiny-erp-client";
import { connectDB } from "@/lib/db";
import {
  SelfProductIngestService,
  TinyProduct,
} from "@/services/self-product-ingest.service";

function getTinyClient() {
  const token = process.env.TINY_TOKEN;
  if (!token) throw new Error("TINY_TOKEN not configured");
  const plan = (process.env.TINY_PLAN ?? "Evoluir") as TinyPlan;
  return new TinyClient({ token, plan });
}

export async function POST(req: Request) {
  const { tinyId } = await req.json();
  if (!tinyId) {
    return NextResponse.json({ error: "tinyId is required" }, { status: 400 });
  }

  let client: TinyClient;
  try {
    client = getTinyClient();
  } catch {
    return NextResponse.json(
      { error: "TINY_TOKEN not configured in environment" },
      { status: 500 },
    );
  }

  const product = await client.products.getProduct(String(tinyId));

  if (!product.sku) {
    return NextResponse.json(
      { error: "Product has no SKU (codigo) — cannot import" },
      { status: 422 },
    );
  }

  // Map ProductClass → Tiny raw classe_produto codes
  const classMap: Record<string, "S" | "K" | "V"> = {
    simple: "S",
    "manufactured": "S",
    "raw-material": "S",
    kit: "K",
    "with-variations": "V",
  };

  const tinyProduct: TinyProduct = {
    id: product.id,
    codigo: product.sku,
    nome: product.name,
    ncm: product.ncm ?? "",
    preco: product.price ?? undefined,
    preco_custo: product.costPrice ?? 0,
    valor_ipi_fixo: product.fixedIpiValue ?? undefined,
    peso_liquido: product.netWeight ?? undefined,
    peso_bruto: product.grossWeight ?? undefined,
    alturaEmbalagem: product.packagingHeight ?? undefined,
    comprimentoEmbalagem: product.packagingLength ?? undefined,
    larguraEmbalagem: product.packagingWidth ?? undefined,
    unidade_por_caixa: product.unitsPerBox
      ? parseFloat(product.unitsPerBox)
      : undefined,
    codigo_pelo_fornecedor: product.supplierProductCode ?? undefined,
    marca: product.brand ?? undefined,
    situacao: product.status === "active" ? "A" : "I",
    classe_produto: product.class
      ? classMap[product.class] ?? undefined
      : undefined,
    // unit: map from library string to enum — only "KIT" and "CB" matter for type resolution
    unidade: (["UN", "KIT", "CB"] as const).includes(
      product.unit as "UN" | "KIT" | "CB",
    )
      ? (product.unit as "UN" | "KIT" | "CB")
      : undefined,
    kit: [],
    anexos: product.externalImages?.map((url) => ({ anexo: url })) ?? [],
  };

  // For kits and combos, fetch component structure
  const isKitOrCombo =
    product.class === "kit" || product.sku.startsWith("COM-");
  if (isKitOrCombo) {
    try {
      const structure = await client.products.getStructure(product.id);
      tinyProduct.kit = structure.components.map((c) => ({
        item: { id_produto: c.componentId, quantidade: c.quantity },
      }));
    } catch {
      // Non-fatal — ingest will proceed without kit links
    }
  }

  await connectDB();
  const service = new SelfProductIngestService();
  const result = await service.ingestOne(tinyProduct);

  return NextResponse.json(result);
}
