"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IPurchaseDashboardItem, PurchaseClassification } from "@/types/purchases";

const QK = ["purchases"] as const;

export function usePurchases() {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery<IPurchaseDashboardItem[]>({
    queryKey: QK,
    queryFn: () => api("/api/purchases"),
  });

  const { mutateAsync: rebuild, isPending: rebuilding } = useMutation({
    mutationFn: () => api("/api/purchases", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  const { mutateAsync: updateField } = useMutation({
    mutationFn: ({
      baseSku,
      field,
      value,
    }: {
      baseSku: string;
      field: "classification" | "order" | "newCost";
      value: PurchaseClassification | number | null;
    }) =>
      api(`/api/purchases/${encodeURIComponent(baseSku)}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  const { mutateAsync: syncCosts, isPending: syncingCosts } = useMutation({
    mutationFn: () => api("/api/purchases/sync-costs", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  return { items, isLoading, rebuild, rebuilding, updateField, syncCosts, syncingCosts };
}
