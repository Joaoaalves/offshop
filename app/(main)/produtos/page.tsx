"use client";

import { useEffect, useState } from "react";
import { SelfProductsTable } from "@/components/self-products/self-product-table";
import { ProductSheet } from "@/components/self-products/product-sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

type Supplier = { _id: string; name: string };

export default function ProductsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    api<Supplier[]>("/api/suppliers").then(setSuppliers).catch(() => { });
  }, []);

  async function syncSpreadsheet() {
    setSyncing(true);
    try {
      await api("/api/self-products/sync-spreadsheet", { method: "POST" });
      toast.success("Sincronizado com sucesso.");
    } catch {
      toast.error("Erro ao sincronizar com a planilha.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncSpreadsheet}
            disabled={syncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar com Planilha
          </Button>
          <ProductSheet suppliers={suppliers} />
        </div>
      </div>

      <SelfProductsTable />
    </div>
  );
}
