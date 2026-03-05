import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ISalesDashboardItem } from "@/types/sales";

export function useSalesDashboard() {
  const {
    data: items,
    isLoading,
    error,
  } = useQuery<ISalesDashboardItem[]>({
    queryKey: ["sales"],
    queryFn: () => api("/api/dashboard/sales"),
    staleTime: 1,
  });

  return {
    items,
    isLoading,
    error,
  };
}
