export const FIELD_LABELS: Record<string, string> = {
  baseSku: "SKU",
  name: "Nome",
  imageUrl: "URL da Imagem",
  manufacturerCode: "Código do Fabricante",
  ncm: "NCM (8 dígitos)",
  unitsPerBox: "Unidades por Caixa",
  supplierName: "Fornecedor (Nome)",
  supplierId: "Fornecedor (ID)",
  cost: "Custo (caixa)",
  priceWithTaxes: "Custo Unitário c/ Impostos",
  lengthCm: "Comprimento (cm)",
  widthCm: "Largura (cm)",
  heightCm: "Altura (cm)",
  volumeM3: "Volume (cm³)",
  weightKg: "Peso (kg)",
  chargeableWeightKg: "Peso Tarifável (kg)",
  minStockDays: "Dias Mínimos de Estoque",
};

export const IMPORT_FIELDS = [
  "baseSku",
  "name",
  "imageUrl",
  "manufacturerCode",
  "ncm",
  "unitsPerBox",
  "supplierName",
  "cost",
  "priceWithTaxes",
  "lengthCm",
  "widthCm",
  "heightCm",
  "volumeM3",
  "weightKg",
  "chargeableWeightKg",
  "minStockDays",
] as const;

const ALIASES: Record<string, string> = {
  sku: "baseSku",
  base_sku: "baseSku",
  basesku: "baseSku",
  nome: "name",
  name: "name",
  imagem: "imageUrl",
  image: "imageUrl",
  image_url: "imageUrl",
  imageurl: "imageUrl",
  codigo_fabricante: "manufacturerCode",
  manufacturer_code: "manufacturerCode",
  cod_fabricante: "manufacturerCode",
  codfabricante: "manufacturerCode",
  ncm: "ncm",
  unidades_por_caixa: "unitsPerBox",
  units_per_box: "unitsPerBox",
  unitsperbox: "unitsPerBox",
  qtd_caixa: "unitsPerBox",
  fornecedor: "supplierName",
  supplier: "supplierName",
  custo: "cost",
  cost: "cost",
  preco_custo: "cost",
  custo_unitario: "priceWithTaxes",
  price_with_taxes: "priceWithTaxes",
  final_unit_price: "priceWithTaxes",
  comprimento: "lengthCm",
  length: "lengthCm",
  lengthcm: "lengthCm",
  largura: "widthCm",
  width: "widthCm",
  widthcm: "widthCm",
  altura: "heightCm",
  height: "heightCm",
  heightcm: "heightCm",
  volume: "volumeM3",
  volumeM3: "volumeM3",
  peso: "weightKg",
  weight: "weightKg",
  weightkg: "weightKg",
  peso_tarifavel: "chargeableWeightKg",
  chargeable_weight: "chargeableWeightKg",
  dias_min_estoque: "minStockDays",
  min_stock_days: "minStockDays",
};

/** Returns the schema field for a raw column header, or null if unrecognised. */
export function detectField(raw: string): string | null {
  const key = raw
    .toLowerCase()
    .replace(/[\s\-]/g, "_")
    .replace(/[^\w]/g, "");
  return ALIASES[key] ?? ALIASES[key.replace(/_/g, "")] ?? null;
}

// ─── Value sanitisation ───────────────────────────────────────────────────────

const NUMERIC_FIELDS = new Set([
  "cost", "priceWithTaxes",
  "lengthCm", "widthCm", "heightCm", "volumeM3",
  "weightKg", "chargeableWeightKg",
  "unitsPerBox", "minStockDays",
]);

/**
 * Converts a raw Brazilian-formatted string (e.g. "R$ 1.234,56" or "15,5%")
 * to a plain decimal string that Zod's `z.coerce.number()` can parse.
 *
 * Rules:
 *   - Strip everything except digits, `.` and `,`
 *   - If both `.` and `,` are present → `.` is thousands sep, `,` is decimal
 *     e.g.  "1.234,56"  →  "1234.56"
 *   - If only `,` → decimal comma
 *     e.g.  "1234,56"   →  "1234.56"
 *   - If only `.` or plain digits → keep as-is
 */
function parseBRNumber(raw: string): string {
  const stripped = raw.replace(/[^\d.,]/g, "");
  if (stripped === "") return "";

  const hasComma = stripped.includes(",");
  const hasDot   = stripped.includes(".");

  if (hasComma && hasDot) {
    // "1.234,56" — dot is thousands separator
    return stripped.replace(/\./g, "").replace(",", ".");
  }
  if (hasComma) {
    // "1234,56" — comma is decimal separator
    return stripped.replace(",", ".");
  }
  return stripped; // already valid ("1234.56" or "1234")
}

/**
 * Sanitises a raw import value based on its target schema field:
 *   - Numeric fields: BR-number parsing (handles R$, %, commas, dots)
 *   - ncm: strip all non-digit characters
 *   - Everything else: trimmed as-is
 */
export function sanitizeFieldValue(field: string, value: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";

  if (NUMERIC_FIELDS.has(field)) return parseBRNumber(trimmed);
  if (field === "ncm")           return trimmed.replace(/\D/g, "");

  return trimmed;
}
