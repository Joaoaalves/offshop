import { useCallback, useEffect, useState } from "react";

export function useShrinkableColumns(storageKey: string) {
  const [shrunken, setShrunken] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setShrunken(new Set(JSON.parse(stored) as string[]));
    } catch {}
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([...shrunken]));
    } catch {}
  }, [shrunken, storageKey, mounted]);

  const toggle = useCallback((groupKey: string) => {
    setShrunken((prev) => {
      const next = new Set(prev);
      next.has(groupKey) ? next.delete(groupKey) : next.add(groupKey);
      return next;
    });
  }, []);

  const registerDefaults = useCallback(
    (groupKeys: string[]) => {
      if (!mounted) return;
      setShrunken((prev) => {
        const stored = localStorage.getItem(storageKey);
        if (stored) return prev;
        const next = new Set(prev);
        groupKeys.forEach((k) => next.add(k));
        return next;
      });
    },
    [mounted, storageKey],
  );

  const isShrunken = useCallback(
    (groupKey: string) => !mounted || shrunken.has(groupKey),
    [shrunken, mounted],
  );

  return { shrunken, toggle, isShrunken, registerDefaults, mounted };
}
