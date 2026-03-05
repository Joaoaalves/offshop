"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import StockTag from "../stock-tag";
import { abcToLetter, abcVariant, statusLabel, statusVariant } from "@/lib/sales-utils";
import { AbcCurve } from "@/types/enums";
import { MonthCells } from "./month-cells";
import { ConversionCell } from "./conversion-cell";
import { forwardRef, memo } from "react";
import { SalesRow } from "@/types/sales";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";

type ColVis = { isVisible: (key: string) => boolean };

/**
 * Linha SKU (nível agregado).
 *
 * forwardRef + memo: o TanStack Virtual precisa do ref na <tr> para medir
 * a altura real de cada linha via virtualizer.measureElement.
 * memo evita re-renders desnecessários quando outros dados mudam.
 */
export const SalesTableRow = memo(
    forwardRef<HTMLTableRowElement, {
        row: SalesRow;
        index: number;
        isMonthShrunken: boolean;
        colVis: ColVis;
        isExpanded: boolean;
        onToggle: () => void;
        "data-index"?: number;
    }>(function SalesTableRow({ row, index, isMonthShrunken, colVis, isExpanded, onToggle, ...rest }, ref) {

        const handleClipboard = async () => {
            try {
                await navigator.clipboard.writeText(row.sku);
                toast.success("SKU copiado com sucesso!");
            } catch {
                toast.error("Ocorreu um erro ao copiar o SKU!");
            }
        };

        // Estoque por modalidade (derivado dos produtos)
        const fullStock = row.products?.reduce(
            (s, p) => (p.logisticType === "fulfillment" ? s + p.availableQuantity : s), 0
        ) ?? 0;
        const flexStock = row.products?.reduce(
            (s, p) => (p.logisticType !== "fulfillment" ? s + p.availableQuantity : s), 0
        ) ?? 0;

        const canExpand = (row.products?.length ?? 0) > 1;


        return (
            <TableRow
                ref={ref}
                {...rest}
                className="group transition-colors border-b hover:bg-muted/30"
            >
                {/* ── SKU ─────────────────────────────────────────────── */}
                {colVis.isVisible("col-sku") && (<TableCell
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
                                    aria-label={isExpanded ? "Recolher produtos" : "Expandir produtos"}
                                >
                                    {isExpanded
                                        ? <ChevronDown className="w-3.5 h-3.5" />
                                        : <ChevronRight className="w-3.5 h-3.5" />
                                    }
                                </button>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-muted-foreground">
                                    {row.products?.length ?? 1} anúncio{(row.products?.length ?? 1) !== 1 ? "s" : ""}
                                </span>
                                <StockTag product={row} />
                            </div>
                        </div>
                    </div>


                </TableCell>
                )}

                {/* ── Curva ABC ───────────────────────────────────────── */}
                {colVis.isVisible("col-abc") && (
                    <TableCell className="py-3 border-r border-border px-0">
                        <div className="flex justify-center items-center">
                            <Badge variant={abcVariant(row.abcCurve)}
                                className={cn(
                                    "text-[10px] font-medium px-1.5 py-0.5 shadow shadow-black/20",
                                    row.abcCurve === AbcCurve.A && "bg-emerald-500 text-white border-emerald-500/30",
                                    row.abcCurve === AbcCurve.B && "bg-neutral-500 text-white border-neutral-400/30",
                                    row.abcCurve === AbcCurve.C && "bg-amber-500 text-white border-amber-500/30",
                                )}>
                                {abcToLetter(row.abcCurve)}
                            </Badge>
                        </div>
                    </TableCell>
                )}

                {/* ── Status ──────────────────────────────────────────── */}
                {colVis.isVisible("col-status") && (
                    <TableCell className="text-start py-3 border-r border-border">
                        <div className="w-full flex justify-center">
                            <Badge variant={statusVariant(row.status)}
                                className={cn(
                                    "text-[10px] font-medium px-1.5 py-0.5",
                                    row.status === "active" && "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
                                    row.status === "paused" && "bg-neutral-500/10 text-neutral-500 border-neutral-400/30",
                                    row.status === "under_review" && "bg-amber-500/15 text-amber-600 border-amber-500/30",
                                )}>
                                {statusLabel(row.status)}
                            </Badge>
                        </div>

                    </TableCell>
                )}

                {/* ── Month cells (dynamic) ───────────────────────────── */}
                <MonthCells
                    resolvedMonths={row.resolvedMonths}
                    dateCreated={row.dateCreated}
                    isVisible={() => true}
                    isShrunken={isMonthShrunken}
                />

                {/* ── Média R$ ────────────────────────────────────────── */}
                {colVis.isVisible("col-avg-rev") && (
                    <TableCell className="py-3 border-l border-border text-start text-[10px]">
                        R${" "}{row.dailyAvg45?.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                )}

                {/* ── Média Un ────────────────────────────────────────── */}
                {colVis.isVisible("col-avg-un") && (
                    <TableCell className="py-3 border-l border-border text-start text-[10px]">
                        <Tooltip>
                            <TooltipTrigger>{row.dailyAvg45.units.toFixed(1)}</TooltipTrigger>
                            <TooltipContent>
                                <div className="grid grid-cols-2 gap-x-3 text-[10px]">
                                    <span>Full</span>  <span>{(row.dailyAvg45.units * (row.stock?.distribution?.fulfillment ?? 0)).toFixed(1)} / Dia</span>
                                    <span>Flex</span>  <span>{(row.dailyAvg45.units * (row.stock?.distribution?.flex ?? 0)).toFixed(1)} / Dia</span>
                                    <span>AG/Col</span><span>{(row.dailyAvg45.units * (row.stock?.distribution?.dropOff ?? 0)).toFixed(1)} / Dia</span>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TableCell>
                )}

                {/* ── Total Receita ────────────────────────────────────── */}
                {colVis.isVisible("col-total-rev") && (
                    <TableCell className="py-3 border-l border-border text-[10px]">
                        R${" "}{row.totals?.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                )}

                {/* ── Total Unidades ───────────────────────────────────── */}
                {colVis.isVisible("col-total-un") && (
                    <TableCell className="py-3 border-r-2 border-border text-start text-[10px]">
                        {row.totals.units}
                    </TableCell>
                )}

                {/* ── Estoque Full ─────────────────────────────────────── */}
                {colVis.isVisible("col-stock-full") && (
                    <TableCell className="py-3 text-[10px]">
                        {fullStock > 0 ? fullStock : "—"}
                    </TableCell>
                )}

                {/* ── Estoque Flex ─────────────────────────────────────── */}
                {colVis.isVisible("col-stock-flex") && (
                    <TableCell className="py-3 border-r-2 border-border text-[10px]">
                        {flexStock > 0 ? flexStock : "—"}
                    </TableCell>
                )}

                {/* ── Conversão ────────────────────────────────────────── */}
                {colVis.isVisible("col-conversion") && (
                    <ConversionCell row={{
                        id: row.sku,
                        currentMonth: row.currentMonth,
                        conversionDropped: row.conversionDropped,
                        conversionDropPct: row.conversionDropPct,
                        months: row.months,
                    }} />
                )}
            </TableRow>
        );
    })
);
