import { SalesRow } from "@/types/sales";
import { SortState } from "@/hooks/tables/use-table-controls";

export type StockSortField =
  | "sku"
  | "fullStock"
  | "fullCoverage"
  | "storageStock"
  | "storageCoverage"
  | "incoming"
  | "damage"
  | "avgDailySales";

export const STOCK_COLUMN_DEFS = [
  { key: "col-sku",              label: "SKU",             group: "Produto",     defaultVisible: true },
  { key: "col-supplier",         label: "Fornecedor",      group: "Produto",     defaultVisible: true },
  { key: "col-full-stock",       label: "Full — Estoque",  group: "Fulfillment", defaultVisible: true },
  { key: "col-full-coverage",    label: "Full — Cobertura",group: "Fulfillment", defaultVisible: true },
  { key: "col-full-suggest",     label: "Full — Repor",    group: "Fulfillment", defaultVisible: true },
  { key: "col-storage-stock",    label: "Galpão — Estoque",  group: "Galpão",    defaultVisible: true },
  { key: "col-storage-coverage", label: "Galpão — Cobertura",group: "Galpão",    defaultVisible: true },
  { key: "col-storage-suggest",  label: "Galpão — Repor",    group: "Galpão",    defaultVisible: true },
  { key: "col-incoming",         label: "A Caminho",       group: "Trânsito",    defaultVisible: true },
  { key: "col-damage",           label: "Avaria",          group: "Trânsito",    defaultVisible: true },
  { key: "col-avg-sales",        label: "Venda/Dia",       group: "Resumo",      defaultVisible: true },
  { key: "col-recommendation",   label: "Recomendação",    group: "Ação",        defaultVisible: true },
];

// ─── Column widths (px) ───────────────────────────────────────────────────────
export const STOCK_COL_W: Record<string, number> = {
  "col-sku":              220,
  "col-supplier":         140,
  "col-full-stock":        70,
  "col-full-coverage":     70,
  "col-full-suggest":      80,
  "col-storage-stock":     70,
  "col-storage-coverage":  70,
  "col-storage-suggest":   80,
  "col-incoming":          80,
  "col-damage":            80,
  "col-avg-sales":         80,
  "col-recommendation":   140,
};

export function sortStockRows(
  rows: SalesRow[],
  sort: SortState<StockSortField>,
): SalesRow[] {
  if (!sort.field) return rows;
  const { field, dir } = sort;
  const mul = dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;

    switch (field) {
      case "sku":
        av = a.sku; bv = b.sku; break;
      case "fullStock":
        av = a.stock?.fulfillment?.stock ?? 0;
        bv = b.stock?.fulfillment?.stock ?? 0; break;
      case "fullCoverage":
        av = a.stock?.fulfillment?.replenishment?.coverage ?? 0;
        bv = b.stock?.fulfillment?.replenishment?.coverage ?? 0; break;
      case "storageStock":
        av = a.stock?.storage?.stock ?? 0;
        bv = b.stock?.storage?.stock ?? 0; break;
      case "storageCoverage":
        av = a.stock?.storage?.replenishment?.coverage ?? 0;
        bv = b.stock?.storage?.replenishment?.coverage ?? 0; break;
      case "incoming":
        av = a.stock?.incoming ?? 0; bv = b.stock?.incoming ?? 0; break;
      case "damage":
        av = a.stock?.damage ?? 0; bv = b.stock?.damage ?? 0; break;
      case "avgDailySales":
        av = a.stock?.avgDailySales ?? 0; bv = b.stock?.avgDailySales ?? 0; break;
    }

    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * mul;
    }
    return ((av as number) - (bv as number)) * mul;
  });
}

// ─── Coverage badge helper ─────────────────────────────────────────────────────
export function coverageBadge(days: number, hasStock: boolean) {
  if (!hasStock || days === 0) {
    return { label: "Sem estoque", cls: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" };
  }
  if (days < 15)  return { label: `${Math.round(days)}d`, cls: "bg-red-500/20 text-red-500 border-red-500/30" };
  if (days < 30)  return { label: `${Math.round(days)}d`, cls: "bg-amber-500/20 text-amber-600 border-amber-500/30" };
  if (days <= 60) return { label: `${Math.round(days)}d`, cls: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" };
  return { label: `${Math.round(days)}d`, cls: "bg-sky-500/20 text-sky-600 border-sky-500/30" };
}
