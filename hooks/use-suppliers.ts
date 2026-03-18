import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSuppliers() {
  const qc = useQueryClient();

  const { data: suppliers, isLoading } = useQuery<any[]>({
    queryKey: ["suppliers"],
    queryFn: () => api("/api/suppliers"),
  });

  const { mutateAsync: createSupplier, isPending: createPending } = useMutation({
    mutationFn: (data: any) =>
      api("/api/suppliers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar fornecedor."),
  });

  const { mutateAsync: updateSupplier, isPending: updatePending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar fornecedor."),
  });

  const { mutateAsync: deleteSupplier, isPending: deletePending } = useMutation({
    mutationFn: (id: string) =>
      api(`/api/suppliers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor removido.");
    },
    onError: () => toast.error("Erro ao remover fornecedor."),
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
