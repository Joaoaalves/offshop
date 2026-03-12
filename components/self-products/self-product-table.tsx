"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import {
  Table, TableBody, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelfProducts } from "@/hooks/use-self-products";
import { exportProductsCSV } from "@/lib/export-csv";
import { ProductRow } from "./table/product-row";

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface ToolbarProps {
  search: string;
  supplierId: string;
  suppliers: { id: string; name: string }[];
  onSearch: (v: string) => void;
  onSupplier: (v: string) => void;
  onExport: () => void;
}

function Toolbar({ search, supplierId, suppliers, onSearch, onSupplier, onExport }: ToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-48 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, SKU ou cód. fabricante…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Select value={supplierId} onValueChange={onSupplier}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Todos os fornecedores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todos os fornecedores</SelectItem>
          {suppliers.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="default" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}

// ─── Supplier section ─────────────────────────────────────────────────────────

interface Group { key: string; name: string; products: any[] }

interface SupplierSectionProps {
  name: string;
  products: any[];
  openRows: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function SupplierSection({ name, products, openRows, onToggle, onDelete }: SupplierSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {name}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal normal-case tracking-normal">
          {products.length}
        </span>
      </h3>

      <div className="max-h-[72vh] overflow-x-auto overflow-y-auto rounded-xl border shadow-sm">
        <Table className="table-fixed border-separate border-spacing-0 relative">

          <TableHeader className="sticky top-0 z-20 bg-muted/90 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8" />
              <TableHead className="w-12" />
              <TableHead>Cód. Fabricante</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Preço Tabela</TableHead>
              <TableHead className="text-right">Preço Unitário</TableHead>
              <TableHead className="text-right">Medidas</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((product: any) => (
              <ProductRow
                key={product._id}
                product={product}
                isOpen={openRows.has(product._id)}
                onToggle={() => onToggle(product._id)}
                onDelete={() => onDelete(product._id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function SelfProductsTable() {
  const { selfProducts, isLoading, deleteSelfProduct } = useSelfProducts();

  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("_all");

  const suppliers = useMemo(() => {
    if (!selfProducts) return [];
    const seen = new Map<string, string>();
    for (const p of selfProducts as any[]) {
      if (p.supplier?._id && !seen.has(p.supplier._id)) {
        seen.set(p.supplier._id, p.supplier.name);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [selfProducts]);

  const filtered = useMemo(() => {
    if (!selfProducts) return [];
    const q = search.toLowerCase().trim();
    return (selfProducts as any[]).filter((p) => {
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.baseSku?.toLowerCase().includes(q) ||
        p.manufacturerCode?.toLowerCase().includes(q);
      const matchesSupplier = supplierId === "_all" || p.supplier?._id === supplierId;
      return matchesSearch && matchesSupplier;
    });
  }, [selfProducts, search, supplierId]);

  const grouped = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const p of filtered) {
      const key = p.supplier?._id ?? "__none__";
      const name = p.supplier?.name ?? "Sem fornecedor";
      if (!map.has(key)) map.set(key, { key, name, products: [] });
      map.get(key)!.products.push(p);
    }
    return Array.from(map.values());
  }, [filtered]);

  function toggleRow(id: string) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDelete(id: string) {
    if (confirm("Deseja remover este produto?")) {
      deleteSelfProduct(id);
    }
  }

  if (isLoading) return <TableSkeleton />;

  return (
    <>
      <Toolbar
        search={search}
        supplierId={supplierId}
        suppliers={suppliers}
        onSearch={setSearch}
        onSupplier={setSupplierId}
        onExport={() => exportProductsCSV(selfProducts as any[])}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border py-20 text-center text-muted-foreground">
          <p className="text-sm">
            {selfProducts?.length === 0
              ? "Nenhum produto cadastrado."
              : "Nenhum produto encontrado para os filtros aplicados."}
          </p>
        </div>
      ) : (
        grouped.map((group) => (
          <SupplierSection
            key={group.key}
            name={group.name}
            products={group.products}
            openRows={openRows}
            onToggle={toggleRow}
            onDelete={handleDelete}
          />
        ))
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full bg-neutral-300 animate-pulse transition-100" />
      ))}
    </div>
  );
}
