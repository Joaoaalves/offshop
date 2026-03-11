"use client";

import { forwardRef, memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trendFalling } from "@/lib/sales";
import { SalesRow } from "@/types/sales";
import StockTag from "../../stock-tag";
import { coverageBadge } from "./stock-table-config";

type ColVis = { isVisible: (key: string) => boolean };

export const StockTableRow = memo(
  forwardRef<HTMLTableRowElement, {
    row: SalesRow;
    index: number;
    colVis: ColVis;
    isExpanded: boolean;
    onToggle: () => void;
    "data-index"?: number;
  }>(function StockTableRow({ row, index: _index, colVis, isExpanded, onToggle, ...rest }, ref) {
    const canExpand = (row.products?.length ?? 0) > 1;
    const isFalling = trendFalling(row);
    const suppressSuggest = isFalling;

    const fullStock = row.stock?.fulfillment?.stock ?? 0;
    const fullCovDays = row.stock?.fulfillment?.replenishment?.coverage ?? 0;
    const fullSuggest = row.stock?.fulfillment?.replenishment?.suggestedUnits ?? 0;

    const storageStock = row.stock?.storage?.stock ?? 0;
    const storageCovDays = row.stock?.storage?.replenishment?.coverage ?? 0;
    const storageSuggest = row.stock?.storage?.replenishment?.suggestedUnits ?? 0;

    const fullCovBadge = coverageBadge(fullCovDays, fullStock > 0);
    const storageCovBadge = coverageBadge(storageCovDays, storageStock > 0);

    return (
      <TableRow
        ref={ref}
        {...rest}
        className="group transition-colors border-b hover:bg-muted/30"
      >
        {/* ── SKU (sticky) ─────────────────────────────────────── */}
        {colVis.isVisible("col-sku") && (
          <TableCell
            className="sticky z-10 text-start py-3 bg-background border-r-2 border-border/40 shadow-[2px_0_1px_rgba(0,0,0,0.02)] border-b border-b-border"
            style={{ left: 0 }}
            onClick={onToggle}
          >
            <div className="flex flex-col">
              <span className="font-mono text-sm text-foreground/80 truncate cursor-pointer">
                {row.sku}
              </span>
              <div className="flex items-center gap-x-1.5 w-full">
                {canExpand && (
                  <button
                    onClick={onToggle}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5" />
                      : <ChevronRight className="w-3.5 h-3.5" />
                    }
                  </button>
                )}
                <div className="flex items-center gap-x-2 min-w-0">
                  {row.products?.length === 1
                    ? <span className="text-[10px] text-muted-foreground">{row.products[0].productId}</span>
                    : <span className="text-[10px] text-muted-foreground">{row.products?.length ?? 1} anúncio{(row.products?.length ?? 1) !== 1 ? "s" : ""}</span>
                  }
                </div>
              </div>
            </div>
          </TableCell>
        )}

        {/* ── Fornecedor ────────────────────────────────────────── */}
        {colVis.isVisible("col-supplier") && (
          <TableCell className="py-3 border-r-2 border-border text-[10px] text-muted-foreground truncate max-w-35">
            {row.stock?.supplier?.name ?? "—"}
          </TableCell>
        )}

        {/* ── Full — Estoque ────────────────────────────────────── */}
        {colVis.isVisible("col-full-stock") && (
          <TableCell className="py-3 border-l border-sky-700/20 text-[10px] text-center">
            {fullStock > 0
              ? <span className="text-sky-600 font-medium">{fullStock} un</span>
              : <span className="text-muted-foreground/40">—</span>
            }
          </TableCell>
        )}

        {/* ── Full — Cobertura ──────────────────────────────────── */}
        {colVis.isVisible("col-full-coverage") && (
          <TableCell className="py-3 border-l border-sky-700/20 text-[10px] text-center">
            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 font-medium border", fullCovBadge.cls)}>
              {fullCovBadge.label}
            </Badge>
          </TableCell>
        )}

        {/* ── Full — Repor ──────────────────────────────────────── */}
        {colVis.isVisible("col-full-suggest") && (
          <TableCell className="py-3 border-l border-r border-sky-700/20 text-[10px] text-center">
            {suppressSuggest || fullSuggest === 0
              ? <span className="text-muted-foreground/40">—</span>
              : <span className="text-sky-600 font-semibold">{fullSuggest} un</span>
            }
          </TableCell>
        )}

        {/* ── Storage — Estoque ─────────────────────────────────── */}
        {colVis.isVisible("col-storage-stock") && (
          <TableCell className="py-3 border-l border-emerald-700/20 text-[10px] text-center">
            {storageStock > 0
              ? <span className="text-emerald-600 font-medium">{storageStock} un</span>
              : <span className="text-muted-foreground/40">—</span>
            }
          </TableCell>
        )}

        {/* ── Storage — Cobertura ───────────────────────────────── */}
        {colVis.isVisible("col-storage-coverage") && (
          <TableCell className="py-3 border-l border-emerald-700/20 text-[10px] text-center">
            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 font-medium border", storageCovBadge.cls)}>
              {storageCovBadge.label}
            </Badge>
          </TableCell>
        )}

        {/* ── Storage — Repor ───────────────────────────────────── */}
        {colVis.isVisible("col-storage-suggest") && (
          <TableCell className="py-3 border-l border-r border-emerald-700/20 text-[10px] text-center">
            {suppressSuggest || storageSuggest === 0
              ? <span className="text-muted-foreground/40">—</span>
              : <span className="text-emerald-600 font-semibold">{storageSuggest} un</span>
            }
          </TableCell>
        )}

        {/* ── A Caminho ─────────────────────────────────────────── */}
        {colVis.isVisible("col-incoming") && (
          <TableCell className="py-3 border-r border-border text-[10px] text-center">
            {(row.stock?.incoming ?? 0) > 0
              ? <span className="text-sky-500 font-medium">{row.stock!.incoming} un</span>
              : <span className="text-muted-foreground/40">—</span>
            }
          </TableCell>
        )}

        {/* ── Avaria ───────────────────────────────────────────── */}
        {colVis.isVisible("col-damage") && (
          <TableCell className="py-3 border-r border-border text-[10px] text-center">
            {(row.stock?.damage ?? 0) > 0
              ? <span className="text-rose-500 font-medium">{row.stock!.damage} un</span>
              : <span className="text-muted-foreground/40">—</span>
            }
          </TableCell>
        )}

        {/* ── Venda/Dia ─────────────────────────────────────────── */}
        {colVis.isVisible("col-avg-sales") && (
          <TableCell className="py-3 border-r border-border text-[10px] text-center">
            <span className="text-foreground/80">{(row.stock?.avgDailySales ?? 0).toFixed(1)}</span>
            <span className="text-[9px] text-muted-foreground/50 ml-0.5">un</span>
          </TableCell>
        )}

        {/* ── Recomendação ─────────────────────────────────────── */}
        {colVis.isVisible("col-recommendation") && (
          <TableCell className="py-3 text-[10px]">
            <div className="flex justify-center">
              <StockTag product={row} showOk />
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }),
);
