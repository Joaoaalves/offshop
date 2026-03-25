"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { usePurchases } from "@/hooks/use-purchases";
import { PurchasesRow } from "./purchases-row";
import { PurchasesActionBar } from "./purchases-action-bar";
import { IPurchaseDashboardItem, PurchaseClassification } from "@/types/purchases";
import { toast } from "sonner";
import { Loader2, RefreshCw, Timer, Package, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Shared column headers ────────────────────────────────────────────────────

function PurchasesTableHead() {
  return (
    <TableHeader className="sticky top-0 z-20 bg-card shadow-md shadow-black">
      {/* Group row */}
      <TableRow className="hover:bg-transparent border-b-0">
        <TableHead colSpan={4} className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-r border-border/40 bg-muted/30">
          Identificação
        </TableHead>
        <TableHead colSpan={4} className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-r border-border/40 bg-muted/30">
          Vendas & Pedido
        </TableHead>
        <TableHead colSpan={5} className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-r border-border/40 bg-muted/30">
          Estoque
        </TableHead>
        <TableHead colSpan={2} className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/30">
          Custo
        </TableHead>
      </TableRow>
      {/* Column row */}
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-7 h-8 bg-muted/20 text-[10px] text-muted-foreground" />
        <TableHead className="w-7 h-8 bg-muted/20 text-[10px] text-muted-foreground" />
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Cód. Fab.</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider border-r border-border/40">SKU</TableHead>

        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">30d</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">15d</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Sugestão</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider border-r border-border/40">Pedido</TableHead>

        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Caminho</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Galpão</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Full</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Galp.+Cam.</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right border-r border-border/40">Total</TableHead>

        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Custo</TableHead>
        <TableHead className="h-8 bg-muted/20 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Novo Custo</TableHead>
      </TableRow>
    </TableHeader>
  );
}

// ─── Supplier section ─────────────────────────────────────────────────────────

function SupplierSection({
  name,
  leadTimeDays,
  items,
  onFieldSave,
}: {
  name: string;
  leadTimeDays: number;
  items: IPurchaseDashboardItem[];
  onFieldSave: (
    baseSku: string,
    field: "classification" | "order" | "newCost",
    value: PurchaseClassification | number | null,
  ) => Promise<void>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const orderCount = items.filter((i) => i.order && i.order > 0).length;
  const alertCount = items.filter(
    (i) =>
      i.sales30d.dailyAvg > 0 &&
      i.restock.daysOfCoverage < Math.max(leadTimeDays, 15) &&
      i.restock.suggestedUnits > 0,
  ).length;

  return (
    <div className="overflow-hidden rounded-lg border border-border shadow-sm">
      {/* Supplier header */}
      <div
        className="flex cursor-pointer items-center justify-between gap-4 border-b border-border bg-muted/20 px-4 py-2.5 select-none"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              collapsed && "-rotate-90",
            )}
          />
          <div className="h-5 w-1 shrink-0 rounded-full bg-primary/50" />
          <span className="truncate text-sm font-semibold tracking-tight">{name}</span>

          <span className="flex items-center gap-1 rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            <Package className="h-2.5 w-2.5" />
            {items.length}
          </span>

          {leadTimeDays > 0 && (
            <span className="flex items-center gap-1 rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              <Timer className="h-2.5 w-2.5" />
              {leadTimeDays}d
            </span>
          )}

          {alertCount > 0 && (
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-600 dark:text-red-400">
              {alertCount} alerta{alertCount !== 1 ? "s" : ""}
            </span>
          )}

          {orderCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
              {orderCount} pedido{orderCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <PurchasesActionBar items={items} />
        </div>
      </div>

      {/* Table */}
      {!collapsed && (
        <div className="overflow-x-auto max-h-[80vh]">
          <Table className="relative">
            <PurchasesTableHead />
            <TableBody>
              {items.map((item, idx) => (
                <PurchasesRow
                  key={item.baseSku}
                  item={item}
                  isEven={idx % 2 === 0}
                  onFieldSave={onFieldSave}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PurchasesTable() {
  const { items, isLoading, rebuild, rebuilding, updateField } = usePurchases();

  const grouped = useMemo(() => {
    const map = new Map<string, IPurchaseDashboardItem[]>();
    for (const item of items) {
      const key = item.supplierName ?? "Sem Fornecedor";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  async function handleFieldSave(
    baseSku: string,
    field: "classification" | "order" | "newCost",
    value: PurchaseClassification | number | null,
  ) {
    try {
      await updateField({ baseSku, field, value });
    } catch {
      toast.error("Erro ao salvar campo.");
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight">Compras</h1>
          {items.length > 0 && (
            <span className={cn(
              "rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
            )}>
              {items.length} SKUs · {grouped.length} fornecedores
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            rebuild()
              .then(() => toast.success("Dashboard atualizado."))
              .catch(() => toast.error("Erro ao atualizar."))
          }
          disabled={rebuilding}
          className="h-8 gap-1.5 text-xs"
        >
          {rebuilding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Atualizar dashboard
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
          Nenhum produto encontrado. Clique em "Atualizar dashboard" para gerar.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([supplierName, products]) => (
            <SupplierSection
              key={supplierName}
              name={supplierName}
              leadTimeDays={products[0]?.supplierLeadTimeDays ?? 0}
              items={products}
              onFieldSave={handleFieldSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
