import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSelfProducts() {
  const qc = useQueryClient();

  const { mutate: createSelfProduct } = useMutation({
    mutationFn: (data: any) =>
      api("/api/internal-product", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["self-products"] });
    },
  });

  const { mutate: deleteSelfProduct } = useMutation({
    mutationFn: (id: string) =>
      api(`/api/internal-product/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["self-products"] });
    },
  });

  const { data: selfProducts, isLoading } = useQuery<any[]>({
    queryKey: ["self-products"],
    queryFn: () => api("/api/internal-product"),
  });

  const { mutate: updateSelfProduct } = useMutation({
    mutationFn: ({ id, data }: any) =>
      api(`/api/internal-product/${id}`, {
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
    deleteSelfProduct,
    updateSelfProduct,
  };
}
