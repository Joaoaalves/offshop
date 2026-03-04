import {
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { monthName } from "@/lib/date-utils";
import { Fragment } from "react/jsx-runtime";
import { BarChart2, Box, CalendarDays, TrendingUp, Repeat2, Layers, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortField, SortState } from "@/hooks/tables/use-table-controls";
import { cn } from "@/lib/utils";
import { MONTH_COLS_EXPANDED, MONTH_COLS_SHRUNKEN } from "./month-cells";


type ColVis = { isVisible: (key: string) => boolean };

type Props = {
    orderedMonths: { year: number; month: number }[];
    sort: SortState;
    onSort: (field: SortField) => void;
    isMonthShrunken: boolean;
    colVis: ColVis;
};

const MONTH_STYLES = [
    { group: "bg-slate-900 text-slate-100", cell: "bg-slate-900/90 text-slate-300" },
    { group: "bg-slate-700 text-slate-100", cell: "bg-slate-700/90 text-slate-200" },
];

// ─── SortableHead ─────────────────────────────────────────────────────────────
function SortableHead({
    field, sort, onSort, children, className, rowSpan,
}: {
    field: SortField;
    sort: SortState;
    onSort: (f: SortField) => void;
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
            className={cn("text-center font-semibold tracking-wider text-[11px] uppercase px-3 py-2.5 whitespace-nowrap", className)}
        >
            <span className="inline-flex items-center justify-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                {label}
            </span>
        </TableHead>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SalesDashboardTableHeader({
    orderedMonths, sort, onSort, isMonthShrunken, colVis,
}: Props) {
    const colsPerMonth = isMonthShrunken ? MONTH_COLS_SHRUNKEN : MONTH_COLS_EXPANDED;
    const monthsCount = orderedMonths.length * colsPerMonth;

    const showMlb = colVis.isVisible("col-mlb");
    const showSku = colVis.isVisible("col-sku");
    const showAbc = colVis.isVisible("col-abc");
    const showStatus = colVis.isVisible("col-status");
    const showAvgRev = colVis.isVisible("col-avg-rev");
    const showAvgUn = colVis.isVisible("col-avg-un");
    const showTotalRev = colVis.isVisible("col-total-rev");
    const showTotalUn = colVis.isVisible("col-total-un");
    const showStockFull = colVis.isVisible("col-stock-full");
    const showStockFlex = colVis.isVisible("col-stock-flex");
    const showConv = colVis.isVisible("col-conversion");

    const productColSpan = [showMlb, showSku, showAbc, showStatus].filter(Boolean).length;
    const avgColSpan = [showAvgRev, showAvgUn].filter(Boolean).length;
    const totalColSpan = [showTotalRev, showTotalUn].filter(Boolean).length;
    const stockColSpan = [showStockFull, showStockFlex].filter(Boolean).length;

    return (
        <TableHeader className="text-xs sticky top-0 z-20">

            {/* ── ROW 1: Groups ─────────────────────────────────── */}
            <TableRow className="hover:bg-transparent border-b-2 border-slate-700">
                {productColSpan > 0 && (
                    <GroupHead icon={Box} label="Produto" colSpan={productColSpan}
                        className="bg-white dark:bg-zinc-950 text-slate-700 dark:text-slate-300 border-r-2 border-slate-200 dark:border-slate-700" />
                )}
                {monthsCount > 0 && (
                    <GroupHead icon={CalendarDays} label="Vendas por Mês" colSpan={monthsCount}
                        className="bg-slate-900 text-white border-x-2 border-slate-700" />
                )}
                {avgColSpan > 0 && (
                    <GroupHead icon={TrendingUp} label="Média Diária (45d)" colSpan={avgColSpan}
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
                    <GroupHead icon={Repeat2} label="Conversão" rowSpan={3}
                        className="bg-indigo-600 text-white border-l border-indigo-500 align-middle" />
                )}
            </TableRow>

            {/* ── ROW 2: Sub-groups + month names ───────────────── */}
            <TableRow className="hover:bg-transparent border-b border-slate-700">
                {showMlb && <SortableHead field="productId" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400">MLB</SortableHead>}
                {showSku && <SortableHead field="sku" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400">SKU</SortableHead>}
                {showAbc && <SortableHead field="abcCurve" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400">Curva</SortableHead>}
                {showStatus && <SortableHead field="status" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-white dark:bg-zinc-950 text-slate-600 dark:text-slate-400 border-r-2 border-slate-200 dark:border-slate-700">Status</SortableHead>}

                {/* Month name headers */}
                {orderedMonths.map((m, idx) => {
                    const style = MONTH_STYLES[idx % 2];
                    return (
                        <TableHead key={`${m.year}-${m.month}`} colSpan={colsPerMonth}
                            className={cn("text-center font-semibold text-[11px] uppercase tracking-widest px-2 py-2 border-x border-slate-700", style.group)}>
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
                    className="bg-violet-800 text-violet-100 border-r-2 border-violet-700">Unidades</SortableHead>}
                {showStockFull && <SortableHead field="availableQuantity" sort={sort} onSort={onSort} rowSpan={2}
                    className="bg-sky-600 text-white border-x border-sky-500">Full</SortableHead>}
                {showStockFlex && (
                    <TableHead rowSpan={2}
                        className="text-center bg-sky-600 text-white font-medium text-[11px] uppercase tracking-wider px-3 py-2 border-r-2 border-sky-500">
                        Flex
                    </TableHead>
                )}
            </TableRow>

            {/* ── ROW 3: Month column details ────────────────────── */}
            <TableRow className="hover:bg-transparent border-b-2 border-slate-700 shadow-lg shadow-black/20 bg-white">
                {orderedMonths.map((m, idx) => {
                    const style = MONTH_STYLES[idx % 2];
                    const headCls = (extra: string) =>
                        cn("text-center text-[10px] font-medium tracking-wider px-2 py-1.5", style.cell, extra);

                    if (isMonthShrunken) {
                        return (
                            <Fragment key={`${m.year}-${m.month}-detail`}>
                                <TableHead className={headCls("text-left border-l border-slate-700")}>R$</TableHead>
                                <TableHead className={headCls("border-r-2 border-slate-700")}>Un</TableHead>
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment key={`${m.year}-${m.month}-detail`}>
                            <TableHead className={headCls("text-left border-l border-slate-700")}>R$</TableHead>
                            <TableHead className={headCls("border-slate-600")}>Full</TableHead>
                            <TableHead className={headCls("border-slate-600")}>Flex</TableHead>
                            <TableHead className={headCls("border-r-2 border-slate-700")}>Ag / Col</TableHead>
                        </Fragment>
                    );
                })}
            </TableRow>
        </TableHeader>
    );
}