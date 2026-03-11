export const FIELD_LABELS: Record<string, string> = {
  baseSku:            "SKU",
  name:               "Nome",
  imageUrl:           "URL da Imagem",
  manufacturerCode:   "Código do Fabricante",
  ncm:                "NCM (8 dígitos)",
  unitsPerBox:        "Unidades por Caixa",
  supplierName:       "Fornecedor (Nome)",
  supplierId:         "Fornecedor (ID)",
  tablePrice:         "Preço de Tabela",
  icms:               "ICMS (%)",
  ipi:                "IPI (%)",
  difal:              "DIFAL (%)",
  storageCost:        "Custo de Armazenamento",
  lengthCm:           "Comprimento (cm)",
  widthCm:            "Largura (cm)",
  heightCm:           "Altura (cm)",
  volumeCm3:          "Volume (cm³)",
  weightKg:           "Peso (kg)",
  chargeableWeightKg: "Peso Tarifável (kg)",
  minStockDays:       "Dias Mínimos de Estoque",
};

export const IMPORT_FIELDS = [
  "baseSku", "name", "imageUrl", "manufacturerCode", "ncm", "unitsPerBox",
  "supplierName",
  "tablePrice", "icms", "ipi", "difal", "storageCost",
  "lengthCm", "widthCm", "heightCm", "volumeCm3", "weightKg", "chargeableWeightKg",
  "minStockDays",
] as const;

const ALIASES: Record<string, string> = {
  sku: "baseSku", base_sku: "baseSku", basesku: "baseSku",
  nome: "name", name: "name",
  imagem: "imageUrl", image: "imageUrl", image_url: "imageUrl", imageurl: "imageUrl",
  codigo_fabricante: "manufacturerCode", manufacturer_code: "manufacturerCode",
  cod_fabricante: "manufacturerCode", codfabricante: "manufacturerCode",
  ncm: "ncm",
  unidades_por_caixa: "unitsPerBox", units_per_box: "unitsPerBox",
  unitsperbox: "unitsPerBox", qtd_caixa: "unitsPerBox",
  fornecedor: "supplierName", supplier: "supplierName",
  preco_tabela: "tablePrice", table_price: "tablePrice",
  tableprice: "tablePrice", preco: "tablePrice", price: "tablePrice",
  icms: "icms",
  ipi: "ipi",
  difal: "difal",
  custo_armazenamento: "storageCost", storage_cost: "storageCost",
  comprimento: "lengthCm", length: "lengthCm", lengthcm: "lengthCm",
  largura: "widthCm", width: "widthCm", widthcm: "widthCm",
  altura: "heightCm", height: "heightCm", heightcm: "heightCm",
  volume: "volumeCm3", volumecm3: "volumeCm3",
  peso: "weightKg", weight: "weightKg", weightkg: "weightKg",
  peso_tarifavel: "chargeableWeightKg", chargeable_weight: "chargeableWeightKg",
  dias_min_estoque: "minStockDays", min_stock_days: "minStockDays",
};

/** Returns the schema field for a raw column header, or null if unrecognised. */
export function detectField(raw: string): string | null {
  const key = raw.toLowerCase().replace(/[\s\-]/g, "_").replace(/[^\w]/g, "");
  return ALIASES[key] ?? ALIASES[key.replace(/_/g, "")] ?? null;
}
