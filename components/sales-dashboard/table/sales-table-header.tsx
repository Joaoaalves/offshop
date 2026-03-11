"use client";

import {
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { monthName } from "@/lib/date-utils";
import { Fragment } from "react/jsx-runtime";
import { BarChart2, Box, CalendarDays, TrendingUp, Repeat2, Layers, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortState } from "@/hooks/tables/use-table-controls";
import { SortField } from "./sales-table-config";
import { cn } from "@/lib/utils";


type ColVis = { isVisible: (key: string) => boolean };

type Props = {
    orderedMonths: { year: number; month: number }[];
    sort: SortState<SortField>;
    onSort: (field: SortField) => void;
    isMonthShrunken: boolean;
    colVis: ColVis;
    avgPeriod: 30 | 45;
};

const MONTH_STYLES = [
    { group: "bg-slate-900 text-slate-100", cell: "bg-slate-900/90 text-slate-300" },
    { group: "bg-slate-700 text-slate-100", cell: "bg-slate-700/90 text-slate-200" },
];

// ─── SortableHead ─────────────────────────────────────────────────────────────
function SortableHead({
    field, sort, onSort, children, className, rowSpan, style,
}: {
    field: SortField;
    sort: SortState<SortField>;
    onSort: (f: SortField) => void;
    children: React.ReactNode;
    className?: string;
    rowSpan?: number;
    style?: React.CSSProperties;
}) {
    const active = sort.field === field;
    return (
        <TableHead
            rowSpan={rowSpan}
            onClick={() => onSort(field)}
            style={style}
            className={cn(
                "cursor-pointer select-none group",
                "text-center font-medium text-[11px] uppercase tracking-wider px-3 py-2 whitespace-nowrap",
                className
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
function GroupHead({ icon: Icon, label, colSpan, rowSpan, className }: {
    icon?: React.ElementType; label: string;
    colSpan?: number; rowSpan?: number; className?: string;
}) {
    return (
        <TableHead
            colSpan={colSpan} rowSpan={rowSpan}
            className={cn("text-center font-semibold tracking-wider text-[9px] uppercase px-3 py-2.5 whitespace-nowrap", className)}
        >
            <span className="inline-flex items-center justify-center gap-1.5">
                {Icon && <Icon className="w-3 h-3 opacity-80" />}
                {label}
            </span>
        </TableHead>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SalesDashboardTableHeader({
    orderedMonths, sort, onSort, isMonthShrunken, colVis, avgPeriod,
}: Props) {
    const showSku = colVis.isVisible("col-sku");
    const showAbc = colVis.isVisible("col-abc");
    const showStatus = colVis.isVisible("col-status");

    const showMonthRev = colVis.isVisible("col-month-rev");
    const showMonthUn = colVis.isVisible("col-month-un");

    const showAvgRev = colVis.isVisible("col-avg-rev");
    const showAvgUn = colVis.isVisible("col-avg-un");
    const showTotalRev = colVis.isVisible("col-total-rev");
    const showTotalUn = colVis.isVisible("col-total-un");
    const showStockFull = colVis.isVisible("col-stock-full");
    const showStockFlex = colVis.isVisible("col-stock-flex");
    const showConv = colVis.isVisible("col-conversion");

    // colsPerMonth dinâmico conforme visibilidade das sub-colunas
    const unCols = isMonthShrunken ? 1 : 3;
    const colsPerMonth = (showMonthRev ? 1 : 0) + (showMonthUn ? unCols : 0);
    const monthsCount = orderedMonths.length * colsPerMonth;

    const productColSpan = [showSku, showAbc, showStatus].filter(Boolean).length;
    const avgColSpan = [showAvgRev, showAvgUn].filter(Boolean).length;
    const totalColSpan = [showTotalRev, showTotalUn].filter(Boolean).length;
    const stockColSpan = [showStockFull, showStockFlex].filter(Boolean).length;

    // Offset para sticky SKU (se col-mlb visível = 100px, senão 0)
    const skuLeft = 0;

    const now = new Date();

    return (
        <TableHeader className="text-xs sticky top-0 z-20 shadow-xl shadow-black">

            {/* ── ROW 1: Groups ─────────────────────────────────── */}
            <TableRow className="hover:bg-transparent border-b-2 border-slate-700">
                {productColSpan > 0 && (
                    <GroupHead icon={Box} label="Produto" colSpan={productColSpan}
                        className="left-0 z-30 bg-white dark:bg-zinc-950 text-slate-700 dark:text-slate-300 border-r-2 border-slate-200 dark:border-slate-700" />
                )}
                {monthsCount > 0 && (
                    <GroupHead icon={CalendarDays} label="Vendas por Mês" colSpan={monthsCount}
                        className="bg-slate-900 text-white border-x-2 border-slate-700" />
                )}
                {avgColSpan > 0 && (
                    <GroupHead icon={TrendingUp} label={`Média Diária (${avgPeriod}d)`} colSpan={avgColSpan}
                        className="bg-violet-700 text-white border-x border-violet-600" />
                )}
                {totalColSpan > 0 && (
                    <GroupHead icon={BarChart2} label="Total (120d)" colSpan={totalColSpan}
                        className="bg-violet-800 text-white border-x border-violet-700" />
                )}
                {stockColSpan > 0 && (
                    <GroupHead icon={Layers} label="Estoque" colSpan={stockColSpan}
                        className="bg-sky-600 text-white border-x border-sky-500" />
                )}
                {showConv && (
                    <GroupHead icon={Repeat2} label="Conversão" rowSpan={1}
                        className="bg-indigo-600 text-white border-l border-indigo-500 align-middle" />
                )}
            </TableRow>

            {/* ── ROW 2: Sub-groups + month names ───────────────── */}
            <TableRow className="hover:bg-transparent border-b border-slate-700">
                {showSku && (
                    <SortableHead field="sku" sort={sort} onSort={onSort} rowSpan={2}
                        style={{ left: skuLeft }}
                        className="sticky z-30 bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400 text-[9px] font-semibold border-r-2 border-slate-200 dark:border-slate-700">
                        SKU
                    </SortableHead>
                )}
                {showAbc && (
                    <SortableHead field="abcCurve" sort={sort} onSort={onSort} rowSpan={2}
                        className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400 text-[9px] font-semibold">
                        Curva
                    </SortableHead>
                )}
                {showStatus && (
                    <SortableHead field="status" sort={sort} onSort={onSort} rowSpan={2}
                        className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400 border-r-2 border-slate-200 dark:border-slate-700 text-[9px] font-semibold">
                        Status
                    </SortableHead>
                )}

                {/* Month name headers */}
                {colsPerMonth > 0 && orderedMonths.map((m, idx) => {
                    const style = MONTH_STYLES[idx % 2];
                    return (
                        <TableHead key={`${m.year}-${m.month}`} colSpan={colsPerMonth}
                            className={cn("text-center font-bold text-[9px] uppercase tracking-widest px-2 py-2 border-x border-slate-700", style.group)}>
                            <span className="inline-flex flex-col items-center leading-tight gap-0.5">
                                <span>{monthName(m.month)}</span>
                                <span className="text-[9px] font-normal opacity-60">{m.year}</span>
                            </span>
                        </TableHead>
                    );
                })}

                {showAvgRev && <SortableHead field="dailyAvgRevenue" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-violet-700 text-violet-100 border-x border-violet-600">R$</SortableHead>}
                {showAvgUn && <SortableHead field="dailyAvgUnits" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-violet-700 text-violet-100 border-r-2 border-violet-600">Un</SortableHead>}
                {showTotalRev && <SortableHead field="totalRevenue" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-violet-800 text-violet-100 border-x border-violet-700">Receita</SortableHead>}
                {showTotalUn && <SortableHead field="totalUnits" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-violet-800 text-violet-100 border-r-2 border-violet-700">Un</SortableHead>}
                {showStockFull && <SortableHead field="availableQuantity" sort={sort} onSort={onSort} rowSpan={2}
                    className="text-left bg-sky-600 text-white font-medium text-[9px] uppercase border-r-2 border-sky-500">Full</SortableHead>}
                {showStockFlex && (
                    <TableHead rowSpan={2}
                        className="text-left bg-sky-600 text-white font-medium text-[9px] uppercase border-r-2 border-sky-500">
                        Galpão
                    </TableHead>
                )}
                {showConv && (
                    <SortableHead field="conversion" sort={sort} onSort={onSort} rowSpan={2}
                        className="bg-indigo-600 text-white border-l border-indigo-500 align-middle" >
                        <span className="inline-flex flex-col items-center leading-tight gap-0.5 min-w-full">
                            <span>{monthName(now.getMonth() + 1)}</span>
                            <span className="text-[9px] font-normal opacity-60">{now.getFullYear()}</span>
                        </span>
                    </SortableHead>
                )}
            </TableRow>

            {/* ── ROW 3: Month column details ────────────────────── */}
            <TableRow className="bg-white border-slate-700">
                {colsPerMonth > 0 && orderedMonths.map((m, idx) => {
                    const style = MONTH_STYLES[idx % 2];
                    const headCls = (extra: string) =>
                        cn("text-center text-[10px] font-medium tracking-wider px-2 py-1.5", style.cell, extra);
                    const revField = `month-rev-${m.year}-${m.month}` as SortField;
                    const unField = `month-un-${m.year}-${m.month}` as SortField;

                    if (isMonthShrunken) {
                        return (
                            <Fragment key={`${m.year}-${m.month}-detail`}>
                                {showMonthRev && (
                                    <SortableHead field={revField} sort={sort} onSort={onSort}
                                        className={headCls("text-[9px] text-left border-l border-slate-700")}>
                                        R$
                                    </SortableHead>
                                )}
                                {showMonthUn && (
                                    <SortableHead field={unField} sort={sort} onSort={onSort}
                                        className={headCls("text-[9px] border-r-2 border-slate-700")}>
                                        Un
                                    </SortableHead>
                                )}
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment key={`${m.year}-${m.month}-detail`}>
                            {showMonthRev && (
                                <SortableHead field={revField} sort={sort} onSort={onSort}
                                    className={headCls("text-[9px] text-left border-l border-slate-700")}>
                                    R$
                                </SortableHead>
                            )}
                            {showMonthUn && (
                                <>
                                    <TableHead className={headCls("text-[9px] border-slate-600")}>Full</TableHead>
                                    <TableHead className={headCls("text-[9px] border-slate-600")}>Flex</TableHead>
                                    <TableHead className={headCls("text-[9px] border-r-2 border-slate-700")}>Ag / Col</TableHead>
                                </>
                            )}
                        </Fragment>
                    );
                })}
            </TableRow>
        </TableHeader>
    );
}
