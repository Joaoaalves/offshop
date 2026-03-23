"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IApiToken } from "@/models/ApiToken";

const QK = ["api-tokens"];

export function useApiTokens() {
  const qc = useQueryClient();

  const { data: tokens = [], isLoading } = useQuery<
    Omit<IApiToken, "tokenHash">[]
  >({
    queryKey: QK,
    queryFn: () => fetch("/api/admin/api-tokens").then((r) => r.json()),
  });

  const createMutation = useMutation<
    { token: string; name: string; prefix: string; _id: string },
    Error,
    { name: string }
  >({
    mutationFn: ({ name }) =>
      fetch("/api/admin/api-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  const revokeMutation = useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetch(`/api/admin/api-tokens/${id}`, { method: "DELETE" }).then(() =>
        undefined,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  return {
    tokens,
    isLoading,
    createToken: (name: string) => createMutation.mutateAsync({ name }),
    creating: createMutation.isPending,
    revokeToken: (id: string) => revokeMutation.mutateAsync(id),
    revoking: revokeMutation.isPending,
  };
}
