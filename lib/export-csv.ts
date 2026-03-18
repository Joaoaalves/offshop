const COLUMNS: {
  key: string;
  header: string;
  get: (p: any) => string | number;
}[] = [
  {
    key: "productType",
    header: "Tipo",
    get: (p) => p.productType ?? "simples",
  },
  { key: "baseSku", header: "SKU", get: (p) => p.baseSku ?? "" },
  { key: "name", header: "Nome", get: (p) => p.name ?? "" },
  {
    key: "manufacturerCode",
    header: "Código Fabricante",
    get: (p) => p.manufacturerCode ?? "",
  },
  { key: "ncm", header: "NCM", get: (p) => p.ncm ?? "" },
  { key: "kitQuantity", header: "Qtd. Kit", get: (p) => p.kitQuantity ?? "" },
  {
    key: "parentSku",
    header: "SKU Produto Base",
    get: (p) =>
      typeof p.parentProduct === "object"
        ? (p.parentProduct?.baseSku ?? "")
        : "",
  },
  {
    key: "comboComponents",
    header: "Componentes (SKU×Qtd)",
    get: (p) =>
      Array.isArray(p.components)
        ? p.components
            .map(
              (c: any) =>
                `${typeof c.product === "object" ? c.product?.baseSku : c.product}×${c.quantity}`,
            )
            .join("|")
        : "",
  },
  {
    key: "unitsPerBox",
    header: "Unidades por Caixa",
    get: (p) => p.unitsPerBox ?? "",
  },
  {
    key: "supplierName",
    header: "Fornecedor",
    get: (p) => p.supplier?.name ?? "",
  },
  { key: "tablePrice", header: "Preço Tabela", get: (p) => p.tablePrice ?? "" },
  { key: "icms", header: "ICMS (%)", get: (p) => p.icms ?? "" },
  { key: "ipi", header: "IPI (%)", get: (p) => p.ipi ?? "" },
  { key: "difal", header: "DIFAL (%)", get: (p) => p.difal ?? "" },
  {
    key: "storageCost",
    header: "Custo Armazenamento",
    get: (p) => p.storageCost ?? "",
  },
  {
    key: "priceWithTaxes",
    header: "Preço c/ Impostos",
    get: (p) =>
      p.priceWithTaxes != null ? Number(p.priceWithTaxes).toFixed(2) : "",
  },
  {
    key: "unitPrice",
    header: "Preço Unitário",
    get: (p) => (p.unitPrice != null ? Number(p.unitPrice).toFixed(2) : ""),
  },
  { key: "lengthCm", header: "Comprimento (cm)", get: (p) => p.lengthCm ?? "" },
  { key: "widthCm", header: "Largura (cm)", get: (p) => p.widthCm ?? "" },
  { key: "heightCm", header: "Altura (cm)", get: (p) => p.heightCm ?? "" },
  { key: "volumeM3", header: "Volume (cm³)", get: (p) => p.volumeM3 ?? "" },
  { key: "weightKg", header: "Peso (kg)", get: (p) => p.weightKg ?? "" },
  {
    key: "chargeableWeightKg",
    header: "Peso Tarifável (kg)",
    get: (p) => p.chargeableWeightKg ?? "",
  },
  {
    key: "minStockDays",
    header: "Dias Mín. Estoque",
    get: (p) => p.minStockDays ?? "",
  },
  {
    key: "stock_storage",
    header: "Estoque Galpão",
    get: (p) => p.stock?.storage ?? "",
  },
  {
    key: "stock_incoming",
    header: "Estoque A Caminho",
    get: (p) => p.stock?.incoming ?? "",
  },
  {
    key: "stock_damage",
    header: "Estoque Avaria",
    get: (p) => p.stock?.damage ?? "",
  },
  { key: "imageUrl", header: "URL Imagem", get: (p) => p.imageUrl ?? "" },
];

function escapeCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProductsCSV(products: any[]): void {
  const header = COLUMNS.map((c) => escapeCell(c.header)).join(",");
  const rows = products.map((p) =>
    COLUMNS.map((c) => escapeCell(c.get(p))).join(","),
  );

  const csv = [header, ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `produtos_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
