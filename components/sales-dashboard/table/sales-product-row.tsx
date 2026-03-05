"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { abcToLetter, abcVariant, buildProductMonths, statusLabel, statusVariant } from "@/lib/sales-utils";
import { AbcCurve } from "@/types/enums";
import { MonthCells } from "./month-cells";
import { ConversionCell } from "./conversion-cell";
import { forwardRef, memo, useMemo } from "react";
import { IMlSalesDashboardProduct, SalesRow } from "@/types/sales";
import { toast } from "sonner";

type ColVis = { isVisible: (key: string) => boolean };

/**
 * Linha de produto individual, exibida dentro de um SKU expandido.
 *
 * forwardRef + memo: necessários para integração com TanStack Virtual
 * (measureElement + evitar re-renders desnecessários).
 */
export const SalesProductRow = memo(
    forwardRef<HTMLTableRowElement, {
        product: IMlSalesDashboardProduct;
        parentRow: SalesRow;
        orderedMonths: { year: number; month: number }[];
        isMonthShrunken: boolean;
        colVis: ColVis;
        "data-index"?: number;
    }>(function SalesProductRow({ product, parentRow, orderedMonths, isMonthShrunken, colVis, ...rest }, ref) {

        const handleClipboard = async () => {
            try {
                await navigator.clipboard.writeText(product.sku);
                toast.success("SKU copiado com sucesso!");
            } catch {
                toast.error("Ocorreu um erro ao copiar o SKU!");
            }
        };

        const { resolvedMonths, currentMonth } = useMemo(
            () => buildProductMonths(product.months, orderedMonths),
            [product.months, orderedMonths]
        );

        // Sticky left offsets (must match COL_W in sales-table.tsx)
        const skuLeft = colVis.isVisible("col-mlb") ? 150 : 0;

        return (
            <TableRow
                ref={ref}
                {...rest}
                className={cn(
                    "transition-colors border-b border-border/20",
                    "bg-muted/80 hover:bg-muted/40",
                )}
            >
                {/* ── MLB / Produto ────────────────────────────────────── */}
                {colVis.isVisible("col-mlb") && (
                    <TableCell className="sticky left-0 z-10 py-2 border-r border-border/40 pl-6 bg-muted">
                        <div className="flex items-center gap-x-1.5">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            href={product.link}
                                            target="_blank"
                                            className="text-[10px] font-semibold text-primary hover:underline underline-offset-2 whitespace-nowrap"
                                        >
                                            {product.productId}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>{product.name}</TooltipContent>
                                </Tooltip>
                                <div className="flex items-center gap-x-1 mt-0.5">
                                    {product.isNew && (
                                        <Badge variant="outline" className="text-[9px] text-purple-500 font-normal p-0.5 bg-purple-500/15 border-purple-500">
                                            Novo
                                        </Badge>
                                    )}
                                    {product.logisticType === "fulfillment" && (
                                        <Badge variant="outline" className="text-[9px] font-normal text-white p-0.5 py-0 bg-emerald-500 border-emerald-500/30 shadow shadow-black/20">
                                            FULL
                                        </Badge>
                                    )}
                                    {product.catalogListing && (
                                        <Badge variant="outline" className="text-[9px] font-normal p-0.5 py-0 bg-primary/15 text-primary border-primary/30">
                                            CT
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TableCell>
                )}

                {/* ── SKU do produto ───────────────────────────────────── */}
                {/* {colVis.isVisible("col-sku") && (
                    <TableCell
                        className="sticky z-10 text-start py-2 bg-muted/30 border-r-2 border-border/40 shadow-[2px_0_6px_rgba(0,0,0,0.08)]"
                        style={{ left: skuLeft }}
                        onClick={handleClipboard}
                    >
                        <span className="font-mono font-semibold text-[9px] text-muted-foreground truncate cursor-pointer">
                            {product.sku}
                        </span>
                    </TableCell>
                )} */}

                {/* ── Curva ABC ───────────────────────────────────────── */}
                {colVis.isVisible("col-abc") && (
                    <TableCell className="py-2 border-r border-border px-0">
                        <div className="flex justify-center items-center">
                            <Badge variant={abcVariant(product.abcCurve)}
                                className={cn(
                                    "text-[9px] font-medium px-1 py-0 shadow shadow-black/20",
                                    product.abcCurve === AbcCurve.A && "bg-emerald-500 text-white border-emerald-500/30",
                                    product.abcCurve === AbcCurve.B && "bg-neutral-500 text-white border-neutral-400/30",
                                    product.abcCurve === AbcCurve.C && "bg-amber-500 text-white border-amber-500/30",
                                )}>
                                {abcToLetter(product.abcCurve)}
                            </Badge>
                        </div>
                    </TableCell>
                )}

                {/* ── Status ──────────────────────────────────────────── */}
                {colVis.isVisible("col-status") && (
                    <TableCell className="text-start py-3 border-r border-border">
                        <div className="w-full flex justify-center">
                            <Badge variant={statusVariant(product.status)}
                                className={cn(
                                    "text-[10px] font-medium px-1.5 py-0.5",
                                    product.status === "active" && "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
                                    product.status === "paused" && "bg-neutral-500/10 text-neutral-500 border-neutral-400/30",
                                    product.status === "under_review" && "bg-amber-500/15 text-amber-600 border-amber-500/30",
                                )}>
                                {statusLabel(product.status)}
                            </Badge>
                        </div>

                    </TableCell>
                )}

                {/* ── Month cells (do produto) ─────────────────────────── */}
                <MonthCells
                    resolvedMonths={resolvedMonths}
                    dateCreated={product.dateCreated}
                    isVisible={() => true}
                    isShrunken={isMonthShrunken}
                />

                {/* ── Média R$ (produto) ────────────────────────────────── */}
                {colVis.isVisible("col-avg-rev") && (
                    <TableCell className="py-2 border-l border-border text-start text-[10px] text-muted-foreground">
                        R${" "}{product.dailyAvg45?.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                )}

                {/* ── Média Un (produto) ────────────────────────────────── */}
                {colVis.isVisible("col-avg-un") && (
                    <TableCell className="py-2 border-l border-border text-start text-[10px] text-muted-foreground">
                        <Tooltip>
                            <TooltipTrigger>{product.dailyAvg45.units.toFixed(1)}</TooltipTrigger>
                            <TooltipContent>
                                <span className="text-[10px]">Média diária (últimos 45d) deste anúncio</span>
                            </TooltipContent>
                        </Tooltip>
                    </TableCell>
                )}

                {/* ── Total Receita (produto) ───────────────────────────── */}
                {colVis.isVisible("col-total-rev") && (
                    <TableCell className="py-2 border-l border-border text-[10px] text-muted-foreground">
                        R${" "}{product.totals?.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                )}

                {/* ── Total Unidades (produto) ──────────────────────────── */}
                {colVis.isVisible("col-total-un") && (
                    <TableCell className="py-2 border-r-2 border-border text-start text-[10px] text-muted-foreground">
                        {product.totals.units}
                    </TableCell>
                )}

                {/* ── Estoque Full (produto) ────────────────────────────── */}
                {colVis.isVisible("col-stock-full") && (
                    <TableCell className="py-2 text-[10px] text-muted-foreground">
                        {product.logisticType === "fulfillment" ? product.availableQuantity : "—"}
                    </TableCell>
                )}

                {/* ── Estoque Flex (produto) ────────────────────────────── */}
                {colVis.isVisible("col-stock-flex") && (
                    <TableCell className="py-2 border-r-2 border-border text-[10px] text-muted-foreground">
                        {product.logisticType !== "fulfillment" ? product.availableQuantity : "—"}
                    </TableCell>
                )}

                {/* ── Conversão (produto) ───────────────────────────────── */}
                {colVis.isVisible("col-conversion") && (
                    <ConversionCell row={{
                        id: product.productId,
                        currentMonth,
                        conversionDropped: product.conversionDropped,
                        conversionDropPct: product.conversionDropPct,
                        months: product.months,
                    }} />
                )}
            </TableRow>
        );
    })
);
