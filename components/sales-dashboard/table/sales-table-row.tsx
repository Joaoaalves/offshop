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

type ColVis = { isVisible: (key: string) => boolean };

/**
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
        "data-index"?: number;
    }>(function SalesTableRow({ row, index, isMonthShrunken, colVis, ...rest }, ref) {
        return (
            <TableRow
                ref={ref}
                {...rest}
                className="group transition-colors border-b border-border/40 hover:bg-muted/30"
            >
                {/* ── MLB ─────────────────────────────────────────── */}
                {colVis.isVisible("col-mlb") && (
                    <TableCell className="py-3 pl-4 border-r border-border/40">
                        <div className="flex justify-between w-full">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href={row.link} target="_blank" rel="noopener noreferrer"
                                        className="text-xs font-semibold text-primary hover:underline underline-offset-2 whitespace-nowrap">
                                        {row.productId}
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>{row.name}</TooltipContent>
                            </Tooltip>
                            <div className="flex items-center gap-x-2 ms-2">
                                {row.isNew && (
                                    <Badge variant="outline"
                                        className="text-[10px] text-purple-500 font-normal p-0.5 bg-purple-500/15 border-purple-500">
                                        Novo
                                    </Badge>
                                )}
                                <StockTag product={row} />
                            </div>
                        </div>
                    </TableCell>
                )}

                {/* ── SKU ─────────────────────────────────────────── */}
                {colVis.isVisible("col-sku") && (
                    <TableCell className="text-start py-3">
                        <div className="flex justify-between w-full">
                            <span className="font-mono font-semibold text-[12px] text-foreground/80">{row.sku}</span>
                            <div className="grid grid-cols-[32px_64px] gap-x-2">
                                {row.logisticType === "fulfillment" && (
                                    <Badge variant="outline"
                                        className="text-[10px] font-normal text-white col-start-1 p-0.5 py-0 bg-emerald-500 border-emerald-500/30 ml-2 shadow shadow-black/20">
                                        FULL
                                    </Badge>
                                )}
                                {(row.catalogListing || row.itemRelation != null) && (
                                    <Badge variant="outline"
                                        className="text-[10px] font-normal col-start-2 p-0.5 py-0 bg-primary/15 text-primary border-primary/30 ml-2">
                                        Catálogo
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </TableCell>
                )}

                {/* ── Curva ABC ───────────────────────────────────── */}
                {colVis.isVisible("col-abc") && (
                    <TableCell className="text-center py-3 border-r border-border">
                        <Badge variant={abcVariant(row.abcCurve)}
                            className={cn(
                                "text-[11px] font-medium px-2 py-0.5 shadow shadow-black/20",
                                row.abcCurve === AbcCurve.A && "bg-emerald-500 text-white border-emerald-500/30",
                                row.abcCurve === AbcCurve.B && "bg-neutral-500 text-white border-neutral-400/30",
                                row.abcCurve === AbcCurve.C && "bg-amber-500 text-white border-amber-500/30",
                            )}>
                            {abcToLetter(row.abcCurve)}
                        </Badge>
                    </TableCell>
                )}

                {/* ── Status ──────────────────────────────────────── */}
                {colVis.isVisible("col-status") && (
                    <TableCell className="text-center py-3 border-r border-border">
                        <Badge variant={statusVariant(row.status)}
                            className={cn(
                                "text-[11px] font-medium px-2 py-0.5",
                                row.status === "active" && "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
                                row.status === "paused" && "bg-neutral-500/10 text-neutral-500 border-neutral-400/30",
                                row.status === "under_review" && "bg-amber-500/15 text-amber-600 border-amber-500/30",
                            )}>
                            {statusLabel(row.status)}
                        </Badge>
                    </TableCell>
                )}

                {/* ── Month cells (dynamic) ───────────────────────── */}
                <MonthCells row={row} isVisible={() => true} isShrunken={isMonthShrunken} />

                {/* ── Média R$ ────────────────────────────────────── */}
                {colVis.isVisible("col-avg-rev") && (
                    <TableCell className="py-3 pl-4 border-l border-border text-start text-xs">
                        R${" "}{row.dailyAvg45.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                )}

                {/* ── Média Un ────────────────────────────────────── */}
                {colVis.isVisible("col-avg-un") && (
                    <TableCell className="py-3 pl-4 border-l border-border text-center text-xs">
                        <Tooltip>
                            <TooltipTrigger>{row.dailyAvg45.units.toFixed(1)}</TooltipTrigger>
                            <TooltipContent>
                                <div className="grid grid-cols-2 gap-x-3 text-xs">
                                    <span>Full</span>  <span>{(row.dailyAvg45.units * row.stock.distribution.fulfillment).toFixed(1)} / Dia</span>
                                    <span>Flex</span>  <span>{(row.dailyAvg45.units * row.stock.distribution.flex).toFixed(1)} / Dia</span>
                                    <span>AG/Col</span><span>{(row.dailyAvg45.units * row.stock.distribution.dropOff).toFixed(1)} / Dia</span>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TableCell>
                )}

                {/* ── Total Receita ────────────────────────────────── */}
                {colVis.isVisible("col-total-rev") && (
                    <TableCell className="py-3 pl-4 border-l border-border text-xs">
                        R${" "}{row.totals.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                )}

                {/* ── Total Unidades ───────────────────────────────── */}
                {colVis.isVisible("col-total-un") && (
                    <TableCell className="py-3 pl-4 border-r-2 border-border text-center text-xs">
                        {row.totals.units}
                    </TableCell>
                )}

                {/* ── Estoque Full ─────────────────────────────────── */}
                {colVis.isVisible("col-stock-full") && (
                    <TableCell className="py-3 pl-4 text-xs">
                        {row.logisticType === "fulfillment" ? row.availableQuantity : "—"}
                    </TableCell>
                )}

                {/* ── Estoque Flex ─────────────────────────────────── */}
                {colVis.isVisible("col-stock-flex") && (
                    <TableCell className="py-3 pl-4 border-r-2 border-border text-xs">—</TableCell>
                )}

                {/* ── Conversão ────────────────────────────────────── */}
                {colVis.isVisible("col-conversion") && (
                    <ConversionCell row={row} />
                )}
            </TableRow>
        );
    })
);