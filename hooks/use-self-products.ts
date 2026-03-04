import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSelfProducts() {
  const qc = useQueryClient();

  const { mutateAsync: createSelfProduct, isPending: createPending } =
    useMutation({
      mutationFn: (data: any) =>
        api("/api/self-products", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["self-products"] });
      },
    });

  const { mutateAsync: deleteSelfProduct } = useMutation({
    mutationFn: (id: string) =>
      api(`/api/self-products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["self-products"] });
    },
  });

  const { data: selfProducts, isLoading } = useQuery<any[]>({
    queryKey: ["self-products"],
    queryFn: () => api("/api/self-products"),
  });

  const { mutateAsync: updateSelfProduct } = useMutation({
    mutationFn: ({ id, data }: any) =>
      api(`/api/self-products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["self-products"] });
    },
  });

  return {
    selfProducts,
    isLoading,
    createSelfProduct,
    createPending,
    deleteSelfProduct,
    updateSelfProduct,
  };
}
