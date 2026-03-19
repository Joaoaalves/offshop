"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IPurchaseOrder, IPurchaseOrderItem } from "@/types/purchase-order";

const QK = ["purchase-orders"] as const;

export function usePurchaseOrders() {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<IPurchaseOrder[]>({
    queryKey: QK,
    queryFn: () => api("/api/purchase-orders"),
  });

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: ({
      supplierName,
      items,
    }: {
      supplierName: string;
      items: IPurchaseOrderItem[];
    }) =>
      api("/api/purchase-orders", {
        method: "POST",
        body: JSON.stringify({ supplierName, items }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  const { mutateAsync: markArrived, isPending: markingArrived } = useMutation({
    mutationFn: ({ id, arrivedAt }: { id: string; arrivedAt?: string }) =>
      api(`/api/purchase-orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ arrivedAt }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  return { orders, isLoading, createOrder, markArrived, markingArrived };
}
