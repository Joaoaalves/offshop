"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Box, Package, Warehouse, Truck, BarChart2, Zap, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortState } from "@/hooks/tables/use-table-controls";
import { StockSortField } from "./stock-table-config";
import { cn } from "@/lib/utils";

type ColVis = { isVisible: (key: string) => boolean };

type Props = {
  sort: SortState<StockSortField>;
  onSort: (field: StockSortField) => void;
  colVis: ColVis;
};

// ─── SortableHead ─────────────────────────────────────────────────────────────
function SortableHead({
  field, sort, onSort, children, className, rowSpan,
}: {
  field: StockSortField;
  sort: SortState<StockSortField>;
  onSort: (f: StockSortField) => void;
  children: React.ReactNode;
  className?: string;
  rowSpan?: number;
}) {
  const active = sort.field === field;
  return (
    <TableHead
      rowSpan={rowSpan}
      onClick={() => onSort(field)}
      className={cn(
        "cursor-pointer select-none group",
        "text-center font-medium text-[11px] uppercase tracking-wider px-3 py-2 whitespace-nowrap",
        className,
      )}
    >
      <span className="inline-flex items-center justify-center gap-1">
        {children}
        {active
          ? sort.dir === "asc"
            ? <ArrowUp className="w-3 h-3" />
            : <ArrowDown className="w-3 h-3" />
          : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        }
      </span>
    </TableHead>
  );
}

// ─── GroupHead ────────────────────────────────────────────────────────────────
function GroupHead({ icon: Icon, label, colSpan, className }: {
  icon?: React.ElementType; label: string; colSpan?: number; className?: string;
}) {
  return (
    <TableHead
      colSpan={colSpan}
      className={cn("text-center font-semibold tracking-wider text-[9px] uppercase px-3 py-2.5 whitespace-nowrap", className)}
    >
      <span className="inline-flex items-center justify-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 opacity-80" />}
        {label}
      </span>
    </TableHead>
  );
}

// ─── StaticHead ───────────────────────────────────────────────────────────────
function StaticHead({ children, className, rowSpan }: {
  children: React.ReactNode; className?: string; rowSpan?: number;
}) {
  return (
    <TableHead
      rowSpan={rowSpan}
      className={cn("text-center font-medium text-[11px] uppercase tracking-wider px-3 py-2 whitespace-nowrap", className)}
    >
      {children}
    </TableHead>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StockTableHeader({ sort, onSort, colVis }: Props) {
  const showSku = colVis.isVisible("col-sku");
  const showSupplier = colVis.isVisible("col-supplier");

  const showFullStock = colVis.isVisible("col-full-stock");
  const showFullCov = colVis.isVisible("col-full-coverage");
  const showFullSuggest = colVis.isVisible("col-full-suggest");

  const showStorageStock = colVis.isVisible("col-storage-stock");
  const showStorageCov = colVis.isVisible("col-storage-coverage");
  const showStorageSuggest = colVis.isVisible("col-storage-suggest");

  const showIncoming = colVis.isVisible("col-incoming");
  const showDamage = colVis.isVisible("col-damage");
  const showAvgSales = colVis.isVisible("col-avg-sales");
  const showRec = colVis.isVisible("col-recommendation");

  const productCols = [showSku, showSupplier].filter(Boolean).length;
  const fulfillCols = [showFullStock, showFullCov, showFullSuggest].filter(Boolean).length;
  const storageCols = [showStorageStock, showStorageCov, showStorageSuggest].filter(Boolean).length;
  const transitCols = [showIncoming, showDamage].filter(Boolean).length;

  return (
    <TableHeader className="text-xs sticky top-0 z-20 shadow-xl shadow-black">

      {/* ── ROW 1: Groups ─────────────────────────────────────── */}
      <TableRow className="hover:bg-transparent border-b-2 border-slate-700">
        {productCols > 0 && (
          <GroupHead icon={Box} label="Produto" colSpan={productCols}
            className="sticky left-0 z-30 bg-white dark:bg-zinc-950 text-slate-700 dark:text-slate-300 border-r-2 border-slate-200 dark:border-slate-700" />
        )}
        {fulfillCols > 0 && (
          <GroupHead icon={Package} label="Fulfillment (ML)" colSpan={fulfillCols}
            className="bg-sky-700 text-white border-x border-sky-600" />
        )}
        {storageCols > 0 && (
          <GroupHead icon={Warehouse} label="Galpão" colSpan={storageCols}
            className="bg-emerald-700 text-white border-x border-emerald-600" />
        )}
        {transitCols > 0 && (
          <GroupHead icon={Truck} label="Trânsito" colSpan={transitCols}
            className="bg-amber-600 text-white border-x border-amber-500" />
        )}
        {showAvgSales && (
          <GroupHead icon={BarChart2} label="Resumo"
            className="bg-violet-700 text-white border-x border-violet-600" />
        )}
        {showRec && (
          <GroupHead icon={Zap} label="Ação"
            className="bg-rose-600 text-white border-l border-rose-500" />
        )}
      </TableRow>

      {/* ── ROW 2: Columns ────────────────────────────────────── */}
      <TableRow className="hover:bg-transparent border-b border-slate-700">
        {showSku && (
          <SortableHead field="sku" sort={sort} onSort={onSort}
            className="sticky left-0 z-30 bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400 text-[9px] font-semibold border-r border-slate-200 dark:border-slate-700">
            SKU
          </SortableHead>
        )}
        {showSupplier && (
          <StaticHead className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400 text-[9px] font-semibold border-r-2 border-slate-200 dark:border-slate-700">
            Fornecedor
          </StaticHead>
        )}

        {/* ── Fulfillment ─── */}
        {showFullStock && (
          <SortableHead field="fullStock" sort={sort} onSort={onSort}
            className="bg-sky-700 text-sky-100 border-l border-sky-600 text-[9px]">
            Estoque
          </SortableHead>
        )}
        {showFullCov && (
          <SortableHead field="fullCoverage" sort={sort} onSort={onSort}
            className="bg-sky-700 text-sky-100 border-l border-sky-600 text-[9px]">
            Cobertura
          </SortableHead>
        )}
        {showFullSuggest && (
          <StaticHead className="bg-sky-700 text-sky-100 border-l border-r border-sky-600 text-[9px]">
            Repor
          </StaticHead>
        )}

        {/* ── Galpão ─── */}
        {showStorageStock && (
          <SortableHead field="storageStock" sort={sort} onSort={onSort}
            className="bg-emerald-700 text-emerald-100 border-l border-emerald-600 text-[9px]">
            Estoque
          </SortableHead>
        )}
        {showStorageCov && (
          <SortableHead field="storageCoverage" sort={sort} onSort={onSort}
            className="bg-emerald-700 text-emerald-100 border-l border-emerald-600 text-[9px]">
            Cobertura
          </SortableHead>
        )}
        {showStorageSuggest && (
          <StaticHead className="bg-emerald-700 text-emerald-100 border-l border-r border-emerald-600 text-[9px]">
            Repor
          </StaticHead>
        )}

        {/* ── Trânsito ─── */}
        {showIncoming && (
          <SortableHead field="incoming" sort={sort} onSort={onSort}
            className="bg-amber-600 text-white border-x border-amber-500 text-[9px]">
            A Caminho
          </SortableHead>
        )}
        {showDamage && (
          <SortableHead field="damage" sort={sort} onSort={onSort}
            className="bg-amber-600 text-white border-r border-amber-500 text-[9px]">
            Avaria
          </SortableHead>
        )}

        {/* ── Resumo ─── */}
        {showAvgSales && (
          <SortableHead field="avgDailySales" sort={sort} onSort={onSort}
            className="bg-violet-700 text-violet-100 border-r border-violet-600 text-[9px]">
            Un/Dia
          </SortableHead>
        )}

        {/* ── Ação ─── */}
        {showRec && (
          <StaticHead className="bg-rose-600 text-rose-100 text-[9px]">
            Recomendação
          </StaticHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
