"use client";

import { useState, useCallback } from "react";

export type FilterType = "select" | "multi-select" | "radio" | "toggle" | "text" | "range";

export interface FilterOptions {
  label: string;
  value: string | number | boolean;
}

export interface Filter<T> {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOptions[]; // For select and radio
  placeholder?: string; // For text
  min?: number; // For range
  max?: number; // For range
  filterFn: (item: T, value: any) => boolean;
}

export function useFilters<T>() {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const setFilterValue = useCallback((id: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const clearFilter = useCallback((id: string) => {
    setFilterValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  return {
    filterValues,
    setFilterValue,
    clearFilter,
    clearAllFilters,
  };
}
