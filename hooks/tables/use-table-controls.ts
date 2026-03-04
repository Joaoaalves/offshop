"use client";

import { SalesRow } from "@/types/sales";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useShrinkableColumns } from "./use-shrinkable-columns";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortField =
  | "productId"
  | "sku"
  | "abcCurve"
  | "status"
  | "dailyAvgRevenue"
  | "dailyAvgUnits"
  | "totalRevenue"
  | "totalUnits"
  | "conversion"
  | "availableQuantity";

export type SortDir = "asc" | "desc";

export interface SortState {
  field: SortField | null;
  dir: SortDir;
}

/** One entry per toggleable column group */
export interface ColumnDef {
  key: string; // unique key
  label: string; // shown in the UI
  group: string; // group label for visual grouping in the toolbar
  defaultVisible: boolean;
}

// ─── Column definitions ───────────────────────────────────────────────────────

export const COLUMN_DEFS: ColumnDef[] = [
  { key: "col-mlb", label: "MLB", group: "Produto", defaultVisible: true },
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

// ─── Visibility ───────────────────────────────────────────────────────────────

function useColumnVisibility(storageKey: string) {
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        COLUMN_DEFS.map((c) => [c.key, c.defaultVisible]),
      ) as Record<string, boolean>,
    [],
  );

  const [visibility, setVisibility] =
    useState<Record<string, boolean>>(defaults);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setVisibility({ ...defaults, ...JSON.parse(stored) });
    } catch {}
    setMounted(true);
  }, [storageKey, defaults]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibility));
    } catch {}
  }, [visibility, storageKey, mounted]);

  const toggleColumn = useCallback((key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isVisible = useCallback(
    (key: string) => visibility[key] ?? true,
    [visibility],
  );

  const resetVisibility = useCallback(
    () => setVisibility(defaults),
    [defaults],
  );

  return { visibility, toggleColumn, isVisible, resetVisibility };
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

function sortRows(rows: SalesRow[], sort: SortState): SalesRow[] {
  if (!sort.field) return rows;
  const { field, dir } = sort;
  const mul = dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;

    switch (field) {
      case "productId":
        av = a.productId;
        bv = b.productId;
        break;
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
        av = a.dailyAvg45.revenue;
        bv = b.dailyAvg45.revenue;
        break;
      case "dailyAvgUnits":
        av = a.dailyAvg45.units;
        bv = b.dailyAvg45.units;
        break;
      case "totalRevenue":
        av = a.totals.revenue;
        bv = b.totals.revenue;
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

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useTableControls(rows: SalesRow[]) {
  const [sort, setSort] = useState<SortState>({ field: null, dir: "desc" });

  const shrink = useShrinkableColumns("sales-shrink-v1");
  const colVis = useColumnVisibility("sales-col-visibility-v1");

  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { field, dir: "desc" };
    });
  }, []);

  const clearSort = useCallback(
    () => setSort({ field: null, dir: "desc" }),
    [],
  );

  const sortedRows = useMemo(() => sortRows(rows, sort), [rows, sort]);

  return {
    // data
    sortedRows,
    // sort
    sort,
    toggleSort,
    clearSort,
    // shrink
    shrink,
    // column visibility
    colVis,
  };
}
