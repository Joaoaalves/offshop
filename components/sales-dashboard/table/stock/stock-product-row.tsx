"use client";

import { forwardRef, memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IMlSalesDashboardProduct, SalesRow } from "@/types/sales";

type ColVis = { isVisible: (key: string) => boolean };

/**
 * Linha de produto expandida na tabela de estoque.
 * Dados como cobertura e repor são calculados no nível SKU,
 * mas o estoque Full (por anúncio) é exibido aqui individualmente.
 */
export const StockProductRow = memo(
  forwardRef<HTMLTableRowElement, {
    product: IMlSalesDashboardProduct;
    parentRow: SalesRow;
    colVis: ColVis;
    "data-index"?: number;
  }>(function StockProductRow({ product, parentRow: _parentRow, colVis, ...rest }, ref) {
    const handleNavigate = () => {
      if (window) window.open(product.link, "_blank");
    };

    const fullStock = product.stock?.full ?? 0;
    const flexStock = product.stock?.flex ?? 0;

    return (
      <TableRow
        ref={ref}
        {...rest}
        className={cn("transition-colors border-b border-border/20", "bg-muted/80 hover:bg-muted/40")}
      >
        {/* ── Identificador do produto (sempre visível quando expandido) ── */}
        {colVis.isVisible("col-sku") && (
          <TableCell
            className="sticky z-10 py-2 bg-muted border-r-2 border-border/40"
            style={{ left: 0 }}
          >
            <div className="flex items-center gap-x-1.5 pl-5">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
              <Tooltip>
                <TooltipTrigger onClick={handleNavigate} asChild>
                  <div className="flex flex-col cursor-pointer min-w-0">
                    <span className="text-[10px] font-medium text-primary hover:underline underline-offset-2 whitespace-nowrap">
                      {product.productId}
                    </span>
                    <span className="text-[9px] text-muted-foreground truncate">{product.sku}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{product.name}</TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-x-1 shrink-0">
                {product.logisticType === "fulfillment" && (
                  <Badge variant="outline" className="text-[8px] font-normal text-white p-0.5 py-0 bg-emerald-500 border-emerald-500/30 shadow shadow-black/20">
                    FULL
                  </Badge>
                )}
                {product.catalogListing && (
                  <Badge variant="outline" className="text-[8px] font-normal p-0.5 py-0 bg-primary/15 text-primary border-primary/30">
                    CT
                  </Badge>
                )}
              </div>
            </div>
          </TableCell>
        )}

        {/* ── Células vazias para manter alinhamento ─────────────────── */}
        {colVis.isVisible("col-supplier") && <TableCell className="py-2 border-r-2 border-border" />}

        {/* ── Full — Estoque (por anúncio) ─────────────────────────── */}
        {colVis.isVisible("col-full-stock") && (
          <TableCell className="py-2 border-l border-sky-700/20 text-[10px] text-center">
            {fullStock > 0
              ? <span className="text-sky-600/70 font-medium">{fullStock}</span>
              : <span className="text-muted-foreground/40">—</span>
            }
          </TableCell>
        )}

        {/* ── Full — Cobertura (não disponível por produto) ─────────── */}
        {colVis.isVisible("col-full-coverage") && (
          <TableCell className="py-2 border-l border-sky-700/20 text-center">
            <span className="text-[9px] text-muted-foreground/40">—</span>
          </TableCell>
        )}

        {/* ── Full — Repor (não disponível por produto) ─────────────── */}
        {colVis.isVisible("col-full-suggest") && (
          <TableCell className="py-2 border-l border-r border-sky-700/20 text-center">
            <span className="text-[9px] text-muted-foreground/40">—</span>
          </TableCell>
        )}

        {/* ── Galpão (nível SKU — exibido apenas no row pai) ───────── */}
        {colVis.isVisible("col-storage-stock") && (
          <TableCell className="py-2 border-l border-emerald-700/20 text-center text-[9px] text-muted-foreground/40">
            {flexStock > 0
              ? <span className="text-sky-600/70 font-medium">{flexStock}</span>
              : <span className="text-muted-foreground/40">—</span>
            }
          </TableCell>
        )}
        {colVis.isVisible("col-storage-coverage") && (
          <TableCell className="py-2 border-l border-emerald-700/20 text-center text-[9px] text-muted-foreground/40">—</TableCell>
        )}
        {colVis.isVisible("col-storage-suggest") && (
          <TableCell className="py-2 border-l border-r border-emerald-700/20 text-center text-[9px] text-muted-foreground/40">—</TableCell>
        )}

        {/* ── Trânsito / Resumo / Ação (nível SKU) ─────────────────── */}
        {colVis.isVisible("col-incoming") && <TableCell className="py-2 border-r border-border text-center text-[9px] text-muted-foreground/40">—</TableCell>}
        {colVis.isVisible("col-damage") && <TableCell className="py-2 border-r border-border text-center text-[9px] text-muted-foreground/40">—</TableCell>}
        {colVis.isVisible("col-avg-sales") && <TableCell className="py-2 border-r border-border" />}
        {colVis.isVisible("col-recommendation") && <TableCell className="py-2" />}
      </TableRow>
    );
  }),
);
