import { Filter } from "@/hooks/tables/use-filters";
import { AbcCurve } from "@/types/enums";
import { SalesRow } from "@/types/sales";

export const SEARCH_FILTER: Filter<SalesRow> = {
  id: "search",
  label: "Procurar",
  type: "text",
  placeholder: "Procurar",
  filterFn: (item: SalesRow, value: string) => {
    const v = value.toLowerCase();
    return (
      item.sku.toLowerCase().includes(v) ||
      item.products.some((p) => p.productId.toLowerCase().includes(v))
    );
  },
};

export const ABC_FILTER: Filter<SalesRow> = {
  id: "abcCurve",
  label: "Curva ABC",
  type: "multi-select",
  options: [
    { label: "A", value: AbcCurve.A },
    { label: "B", value: AbcCurve.B },
    { label: "C", value: AbcCurve.C },
  ],
  filterFn: (item: SalesRow, value: any[]) =>
    !value?.length || value.includes(String(item.abcCurve)),
};

export const STATUS_FILTER: Filter<SalesRow> = {
  id: "status",
  label: "Status",
  type: "multi-select",
  options: [
    { label: "Ativo", value: "active" },
    { label: "Pausado", value: "paused" },
    { label: "Em Revisão", value: "under_review" },
  ],
  filterFn: (item: SalesRow, value: any[]) =>
    !value?.length ||
    item.products.some((p) => value.includes(p.status)),
};

export const FULL_FILTER: Filter<SalesRow> = {
  id: "fulfillment",
  label: "Full",
  type: "toggle",
  filterFn: (item: SalesRow, value: boolean) =>
    !value || item.logisticType === "fulfillment",
};

export const CATALOG_FILTER: Filter<SalesRow> = {
  id: "catalog",
  label: "Catálogo",
  type: "toggle",
  filterFn: (item: SalesRow, value: boolean) =>
    !value || item.products.some((p) => p.catalogListing),
};

export const NEW_FILTER: Filter<SalesRow> = {
  id: "new",
  label: "Novos",
  type: "toggle",
  filterFn: (item: SalesRow, value: boolean) => !value || item.isNew,
};

export const filters: Filter<SalesRow>[] = [
  SEARCH_FILTER,
  ABC_FILTER,
  STATUS_FILTER,
  FULL_FILTER,
  CATALOG_FILTER,
  NEW_FILTER,
];
