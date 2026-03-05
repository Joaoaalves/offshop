import { SalesRow } from "@/types/sales";
import { SortState } from "@/hooks/tables/use-table-controls";

export type SortField =
  | "sku"
  | "abcCurve"
  | "status"
  | "dailyAvgRevenue"
  | "dailyAvgUnits"
  | "totalRevenue"
  | "totalUnits"
  | "conversion"
  | "availableQuantity";

export const COLUMN_DEFS = [
  { key: "col-sku", label: "SKU", group: "Produto", defaultVisible: true },
  {
    key: "col-abc",
    label: "Curva ABC",
    group: "Produto",
    defaultVisible: true,
  },
  {
    key: "col-status",
    label: "Status",
    group: "Produto",
    defaultVisible: true,
  },
  {
    key: "col-avg-rev",
    label: "Média R$",
    group: "Média Diária",
    defaultVisible: true,
  },
  {
    key: "col-avg-un",
    label: "Média Un",
    group: "Média Diária",
    defaultVisible: true,
  },
  {
    key: "col-total-rev",
    label: "Total Receita",
    group: "Total (120d)",
    defaultVisible: true,
  },
  {
    key: "col-total-un",
    label: "Total Unidades",
    group: "Total (120d)",
    defaultVisible: true,
  },
  {
    key: "col-stock-full",
    label: "Estoque Full",
    group: "Estoque",
    defaultVisible: true,
  },
  {
    key: "col-stock-flex",
    label: "Estoque Flex",
    group: "Estoque",
    defaultVisible: true,
  },
  {
    key: "col-conversion",
    label: "Conversão",
    group: "Conversão",
    defaultVisible: true,
  },
];

export function sortSalesRows(
  rows: SalesRow[],
  sort: SortState<SortField>,
): SalesRow[] {
  if (!sort.field) return rows;
  const { field, dir } = sort;
  const mul = dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;

    switch (field) {
      case "sku":
        av = a.sku;
        bv = b.sku;
        break;
      case "abcCurve":
        av = a.abcCurve ?? "";
        bv = b.abcCurve ?? "";
        break;
      case "status":
        av = a.status ?? "";
        bv = b.status ?? "";
        break;
      case "dailyAvgRevenue":
        av = a.dailyAvg45?.revenue;
        bv = b.dailyAvg45?.revenue;
        break;
      case "dailyAvgUnits":
        av = a.dailyAvg45.units;
        bv = b.dailyAvg45.units;
        break;
      case "totalRevenue":
        av = a.totals?.revenue;
        bv = b.totals?.revenue;
        break;
      case "totalUnits":
        av = a.totals.units;
        bv = b.totals.units;
        break;
      case "conversion":
        av = a.currentMonth?.conversionRate ?? 0;
        bv = b.currentMonth?.conversionRate ?? 0;
        break;
      case "availableQuantity":
        av = a.availableQuantity ?? 0;
        bv = b.availableQuantity ?? 0;
        break;
    }

    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * mul;
    }
    return ((av as number) - (bv as number)) * mul;
  });
}
