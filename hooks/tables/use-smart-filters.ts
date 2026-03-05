"use client";

import { useState, useCallback } from "react";

export interface SmartFilter<T> {
  id: string;
  label: string;
  description: string;
  filterFn: (item: T) => boolean;
  sort?: (a: T, b: T) => number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function useSmartFilters<T>(
  initialSmartFilterId?: string,
) {
  const [activeSmartFilterId, setActiveSmartFilterId] = useState<string | null>(
    initialSmartFilterId ?? null,
  );

  const toggleSmartFilter = useCallback((id: string) => {
    setActiveSmartFilterId((prev) => (prev === id ? null : id));
  }, []);

  const clearSmartFilter = useCallback(() => {
    setActiveSmartFilterId(null);
  }, []);

  return {
    activeSmartFilterId,
    setActiveSmartFilterId,
    toggleSmartFilter,
    clearSmartFilter,
  };
}
