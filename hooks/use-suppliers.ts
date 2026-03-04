import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSuppliers() {
  const qc = useQueryClient();

  const { mutateAsync: createSupplier, isPending: createPending } = useMutation(
    {
      mutationFn: (data: any) =>
        api("/api/suppliers", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["suppliers"] });
      },
    },
  );

  const { mutateAsync: deleteSupplier, isPending: deletePending } = useMutation(
    {
      mutationFn: (id: string) =>
        api(`/api/suppliers/${id}`, { method: "DELETE" }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["suppliers"] });
      },
    },
  );

  const { mutateAsync: updateSupplier, isPending: updatePending } = useMutation(
    {
      mutationFn: ({ id, data }: any) =>
        api(`/api/suppliers/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["suppliers"] });
      },
    },
  );

  const { data: suppliers, isLoading } = useQuery<any[]>({
    queryKey: ["suppliers"],
    queryFn: () => api("/api/suppliers"),
  });

  return {
    suppliers,
    isLoading,
    createSupplier,
    createPending,
    updateSupplier,
    updatePending,
    deleteSupplier,
    deletePending,
  };
}
