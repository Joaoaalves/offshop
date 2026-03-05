"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useShrinkableColumns } from "./use-shrinkable-columns";

export type SortDir = "asc" | "desc";

export interface SortState<TField extends string = string> {
  field: TField | null;
  dir: SortDir;
}

export interface ColumnDef {
  key: string;
  label: string;
  group: string;
  defaultVisible: boolean;
}

function useColumnVisibility(storageKey: string, columnDefs: ColumnDef[]) {
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        columnDefs.map((c) => [c.key, c.defaultVisible]),
      ) as Record<string, boolean>,
    [columnDefs],
  );

  const [visibility, setVisibility] = useState<Record<string, boolean>>(defaults);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setVisibility((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {}
    setMounted(true);
  }, [storageKey]);

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

export interface UseTableControlsProps<T, TField extends string = string> {
  data: T[];
  columnDefs: ColumnDef[];
  storageKeyPrefix: string;
  sortFn?: (data: T[], sort: SortState<TField>) => T[];
  initialSort?: SortState<TField>;
}

export function useTableControls<T, TField extends string = string>({
  data,
  columnDefs,
  storageKeyPrefix,
  sortFn,
  initialSort = { field: null, dir: "desc" } as SortState<TField>,
}: UseTableControlsProps<T, TField>) {
  const [sort, setSort] = useState<SortState<TField>>(initialSort);

  const shrink = useShrinkableColumns(`${storageKeyPrefix}-shrink`);
  const colVis = useColumnVisibility(`${storageKeyPrefix}-col-vis`, columnDefs);

  const toggleSort = useCallback((field: TField) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { field, dir: "desc" };
    });
  }, []);

  const clearSort = useCallback(
    () => setSort(initialSort),
    [initialSort.field, initialSort.dir],
  );

  const sortedRows = useMemo(() => {
    if (!sortFn) return data;
    return sortFn(data, sort);
  }, [data, sort, sortFn]);

  return {
    sortedRows,
    sort,
    toggleSort,
    clearSort,
    shrink,
    colVis,
  };
}
