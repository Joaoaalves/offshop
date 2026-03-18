"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliers } from "@/hooks/use-suppliers";
import { EditSupplierDialog } from "./edit-supplier-dialog";
import { DeleteSupplierDialog } from "./delete-supplier-dialog";

export function SuppliersTable() {
  const { suppliers, isLoading } = useSuppliers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!suppliers) return [];
    const q = search.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter(
      (s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.prefix?.toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  if (isLoading) return <TableSkeleton />;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou prefixo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border py-20 text-center text-muted-foreground">
          <p className="text-sm">
            {suppliers?.length === 0
              ? "Nenhum fornecedor cadastrado."
              : "Nenhum fornecedor encontrado para a busca."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Prefixo</TableHead>
                <TableHead className="text-right">Tempo de Entrega</TableHead>
                <TableHead className="text-right">Dias de Segurança</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((supplier: any) => (
                <TableRow key={supplier._id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>

                  <TableCell>
                    {supplier.prefix ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {supplier.prefix}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right tabular-nums text-sm">
                    {supplier.leadTimeDays} dias
                  </TableCell>

                  <TableCell className="text-right tabular-nums text-sm">
                    {supplier.safetyDays} dias
                  </TableCell>

                  <TableCell className="text-right tabular-nums text-sm">
                    {supplier.productCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        supplier.active
                          ? "border-emerald-400 text-emerald-600"
                          : "border-red-400 text-red-600"
                      }
                    >
                      {supplier.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="space-x-2 text-right">
                    <EditSupplierDialog supplier={supplier} />
                    <DeleteSupplierDialog supplier={supplier} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full animate-pulse bg-neutral-300" />
      ))}
    </div>
  );
}
