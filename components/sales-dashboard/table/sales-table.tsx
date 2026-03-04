"use client";

import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import SalesTableHeader from "./sales-table-header";
import { useSalesDashboard } from "@/hooks/dashboard/use-sales-dashboard";
import { buildRows, getOrderedMonths } from "@/lib/sales-utils";
import { Table, TableBody } from "@/components/ui/table";
import { TableToolbar } from "./table-toolbar";
import { SalesRow } from "@/types/sales";
import { useTableControls } from "@/hooks/tables/use-table-controls";
import { SalesTableRow } from "./sales-table-row";


// ─── Column width catalogue (px) ─────────────────────────────────────────────
const COL_W: Record<string, number> = {
    "col-mlb": 160,
    "col-sku": 300,
    "col-abc": 70,
    "col-status": 100,
    "col-avg-rev": 110,
    "col-avg-un": 70,
    "col-total-rev": 90,
    "col-total-un": 80,
    "col-stock-full": 60,
    "col-stock-flex": 60,
    "col-conversion": 120,
};

// Widths for each month column in each mode
//   EXPANDED  → R$(110) | Full(64) | Flex(64) | Drop(64)  = 4 cols
//   SHRUNKEN  → R$(110) | Un(64)                           = 2 cols
const MONTH_W_EXPANDED = [90, 64, 64, 64];
const MONTH_W_SHRUNKEN = [90, 64];

export default function SalesTable() {
    const { items } = useSalesDashboard();
    const parentRef = useRef<HTMLDivElement>(null);

    const { rows, orderedMonths } = useMemo(() => {
        if (!items) return { rows: [] as SalesRow[], orderedMonths: [] };
        const orderedMonths = getOrderedMonths(items);
        return { rows: buildRows(items, orderedMonths), orderedMonths };
    }, [items]);

    const controls = useTableControls(rows);
    const { sortedRows, sort, toggleSort, clearSort, shrink, colVis } = controls;
    const isMonthShrunken = shrink.isShrunken("sales-shrink-v1");

    // Build colgroup widths — must stay in sync with what header+body render
    const colWidths = useMemo(() => {
        const w: number[] = [];

        for (const key of ["col-mlb", "col-sku", "col-abc", "col-status"]) {
            if (colVis.isVisible(key)) w.push(COL_W[key]);
        }

        const monthColWidths = isMonthShrunken ? MONTH_W_SHRUNKEN : MONTH_W_EXPANDED;
        for (let i = 0; i < orderedMonths.length; i++) {
            w.push(...monthColWidths);
        }

        for (const key of ["col-avg-rev", "col-avg-un", "col-total-rev", "col-total-un", "col-stock-full", "col-stock-flex", "col-conversion"]) {
            if (colVis.isVisible(key)) w.push(COL_W[key]);
        }

        return w;
    }, [orderedMonths.length, isMonthShrunken, colVis]);

    const tableMinWidth = colWidths.reduce((a, b) => a + b, 0);

    // measureElement lets the virtualizer measure real DOM row heights
    // instead of relying on a fixed estimate — critical for rows with wrapping content
    const measureElement = useCallback((el: Element) => {
        return (el as HTMLElement).offsetHeight;
    }, []);

    const virtualizer = useVirtualizer({
        count: sortedRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48,
        overscan: 10,
        measureElement,
    });

    const virtualItems = virtualizer.getVirtualItems();
    const totalHeight = virtualizer.getTotalSize();
    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
    const paddingBottom = virtualItems.length > 0
        ? totalHeight - virtualItems[virtualItems.length - 1].end
        : 0;

    return (
        <div className="flex flex-col max-h-[85vh] rounded-xl border border-border overflow-hidden bg-background shadow-sm">
            <TableToolbar
                sort={sort}
                clearSort={clearSort}
                shrunken={shrink.shrunken}
                toggleShrink={shrink.toggle}
                visibility={colVis.visibility}
                toggleColumn={colVis.toggleColumn}
                resetVisibility={colVis.resetVisibility}
                totalRows={sortedRows.length}
            />

            {/* Scroll container — MUST have a fixed height for the virtualizer */}
            <div
                ref={parentRef}
                className="overflow-auto flex-1"
                style={{ height: "calc(100vh - 248px)" }}
            >
                <Table
                    className="table-fixed border-separate border-spacing-0"
                    style={{ minWidth: tableMinWidth }}
                >
                    {/* colgroup defines column widths for table-fixed layout */}
                    <colgroup>
                        {colWidths.map((w, i) => (
                            <col key={i} style={{ width: w, minWidth: w }} />
                        ))}
                    </colgroup>

                    <SalesTableHeader
                        orderedMonths={orderedMonths}
                        sort={sort}
                        onSort={toggleSort}
                        isMonthShrunken={isMonthShrunken}
                        colVis={colVis}
                    />

                    <TableBody>
                        {/* Top spacer: fills virtual space above rendered rows */}
                        {paddingTop > 0 && (
                            <tr aria-hidden style={{ height: paddingTop }}>
                                <td colSpan={colWidths.length} />
                            </tr>
                        )}

                        {virtualItems.map((vRow) => {
                            const row = sortedRows[vRow.index];
                            return (
                                <SalesTableRow
                                    key={`${row.productId}-${row.sku}-${vRow.index}`}
                                    row={row}
                                    index={vRow.index}
                                    isMonthShrunken={isMonthShrunken}
                                    colVis={colVis}
                                    // ref passed to virtualizer for dynamic height measurement
                                    data-index={vRow.index}
                                    ref={virtualizer.measureElement}
                                />
                            );
                        })}

                        {/* Bottom spacer: fills virtual space below rendered rows */}
                        {paddingBottom > 0 && (
                            <tr aria-hidden style={{ height: paddingBottom }}>
                                <td colSpan={colWidths.length} />
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}