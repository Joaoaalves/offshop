"use client";

import { useState, useRef, useEffect } from "react";
import { SortState } from "@/hooks/tables/use-table-controls";
import { StockSortField, STOCK_COLUMN_DEFS } from "./stock-table-config";
import { cn } from "@/lib/utils";
import {
  Columns3,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StockTableToolbarProps {
  sort: SortState<StockSortField>;
  clearSort: () => void;
  visibility: Record<string, boolean>;
  toggleColumn: (key: string) => void;
  resetVisibility: () => void;
  totalRows: number;
}

const COL_GROUPS = Array.from(
  STOCK_COLUMN_DEFS.reduce((acc, col) => {
    if (!acc.has(col.group)) acc.set(col.group, []);
    acc.get(col.group)!.push(col);
    return acc;
  }, new Map<string, typeof STOCK_COLUMN_DEFS>()),
);

export function StockTableToolbar({
  sort, clearSort, visibility, toggleColumn, resetVisibility, totalRows,
}: StockTableToolbarProps) {
  const hiddenCount = Object.values(visibility).filter((v) => !v).length;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{totalRows.toLocaleString("pt-BR")}</span> produtos
        </span>

        {sort.field && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-[11px] font-medium">
            <ArrowUpDown className="w-3 h-3" />
            <span>Ordenado por <strong>{stockFieldLabel(sort.field)}</strong></span>
            {sort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <button onClick={clearSort} className="ml-0.5 hover:text-sky-800 transition-colors" aria-label="Limpar ordenação">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 text-[11px] gap-1.5", hiddenCount > 0 && "border-sky-400/50 text-sky-600 bg-sky-500/5")}
          >
            <Columns3 className="w-3.5 h-3.5" />
            Colunas
            {hiddenCount > 0 && (
              <Badge className="h-4 px-1 text-[10px] bg-sky-500 text-white border-0">
                {hiddenCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold">Visibilidade</span>
            <button
              onClick={resetVisibility}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Resetar
            </button>
          </div>

          {COL_GROUPS.map(([groupName, cols], i) => (
            <div key={groupName}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-1">
                {groupName}
              </DropdownMenuLabel>
              {cols.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={visibility[col.key] ?? true}
                  onCheckedChange={() => toggleColumn(col.key)}
                  className="text-xs"
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stockFieldLabel(field: StockSortField): string {
  const map: Record<StockSortField, string> = {
    sku:              "SKU",
    fullStock:        "Estoque Full",
    fullCoverage:     "Cobertura Full",
    storageStock:     "Estoque Galpão",
    storageCoverage:  "Cobertura Galpão",
    incoming:         "A Caminho",
    damage:           "Avaria",
    avgDailySales:    "Venda/Dia",
  };
  return map[field] ?? field;
}
