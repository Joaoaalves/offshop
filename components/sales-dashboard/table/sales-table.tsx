"use client";

import { useRef, useMemo, useCallback, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import SalesTableHeader from "./sales-table-header";
import { useSalesDashboard } from "@/hooks/dashboard/use-sales-dashboard";
import { buildRows, getOrderedMonths } from "@/lib/sales-utils";
import { Table, TableBody } from "@/components/ui/table";
import { TableToolbar } from "./table-toolbar";
import { IMlSalesDashboardProduct, SalesRow } from "@/types/sales";
import { useTableControls } from "@/hooks/tables/use-table-controls";
import { useSmartFilters } from "@/hooks/tables/use-smart-filters";
import { useFilters } from "@/hooks/tables/use-filters";
import { smartFilters } from "../filters/smart/filters";
import { filters as simpleFilters } from "../filters/simple/filters";
import { COLUMN_DEFS, sortSalesRows, SortField } from "./sales-table-config";
import { SalesTableRow } from "./sales-table-row";
import { SalesProductRow } from "./sales-product-row";
import { SalesDashboardFilters } from "../filters/sales-dashboard-filter";


// ─── FlatRow: discriminated union for virtualizer ─────────────────────────────
type FlatRow =
    | { kind: "sku"; row: SalesRow }
    | { kind: "product"; product: IMlSalesDashboardProduct; parentRow: SalesRow };

// ─── Column width catalogue (px) ─────────────────────────────────────────────
const COL_W: Record<string, number> = {
    "col-sku": 220,
    "col-abc": 60,
    "col-status": 70,
    "col-avg-rev": 80,
    "col-avg-un": 50,
    "col-total-rev": 90,
    "col-total-un": 50,
    "col-stock-full": 50,
    "col-stock-flex": 50,
    "col-conversion": 100,
};


export default function SalesTable() {
    const { items } = useSalesDashboard();
    const parentRef = useRef<HTMLDivElement>(null);
    const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
    const [avgPeriod, setAvgPeriod] = useState<30 | 45>(45);
    const toggleAvgPeriod = useCallback(() => setAvgPeriod(p => p === 45 ? 30 : 45), []);

    const { rows: allRows, orderedMonths } = useMemo(() => {
        if (!items) return { rows: [] as SalesRow[], orderedMonths: [] };
        const orderedMonths = getOrderedMonths(items);
        return { rows: buildRows(items, orderedMonths), orderedMonths };
    }, [items]);

    const { filterValues, setFilterValue, clearFilter } = useFilters<SalesRow>();

    const {
        activeSmartFilterId,
        toggleSmartFilter
    } = useSmartFilters();

    const data = useMemo(() => {
        let result = allRows;

        // Apply Smart Filters
        if (activeSmartFilterId) {
            const sf = smartFilters.find((f) => f.id === activeSmartFilterId);
            if (sf) result = result.filter(sf.filterFn);
        }

        // Apply Simple Filters
        Object.entries(filterValues).forEach(([id, value]) => {
            const filter = simpleFilters.find((f) => f.id === id);
            if (filter && value !== undefined && value !== "") {
                result = result.filter(item => filter.filterFn(item, value));
            }
        });

        return result;
    }, [allRows, activeSmartFilterId, filterValues]);

    const controls = useTableControls<SalesRow, SortField>({
        data,
        columnDefs: COLUMN_DEFS,
        storageKeyPrefix: "sales-v1",
        sortFn: sortSalesRows,
        initialSort: { field: null, dir: "desc" }
    });
    const { sortedRows, sort, toggleSort, clearSort, shrink, colVis } = controls;
    const isMonthShrunken = shrink.isShrunken("sales-shrink-v1");

    const toggleExpand = useCallback((sku: string) => {
        setExpandedSkus(prev => {
            const next = new Set(prev);
            if (next.has(sku)) next.delete(sku);
            else next.add(sku);
            return next;
        });
    }, []);

    // Flatten sorted rows + expanded product sub-rows into a single array for the virtualizer
    const flatRows = useMemo<FlatRow[]>(() => {
        const result: FlatRow[] = [];
        for (const row of sortedRows) {
            result.push({ kind: "sku", row });
            if (expandedSkus.has(row.sku) && (row.products?.length ?? 0) > 1) {
                for (const product of row.products) {
                    result.push({ kind: "product", product, parentRow: row });
                }
            }
        }
        return result;
    }, [sortedRows, expandedSkus]);

    // Build colgroup widths — must stay in sync with what header+body render
    const colWidths = useMemo(() => {
        const w: number[] = [];

        for (const key of ["col-sku", "col-abc", "col-status"]) {
            if (colVis.isVisible(key)) w.push(COL_W[key]);
        }

        const showMonthRev = colVis.isVisible("col-month-rev");
        const showMonthUn  = colVis.isVisible("col-month-un");
        const monthColWidths = [
            ...(showMonthRev ? [80] : []),
            ...(showMonthUn ? (isMonthShrunken ? [40] : [50, 50, 50]) : []),
        ];
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
    const measureElement = useCallback((el: Element) => {
        return (el as HTMLElement).offsetHeight;
    }, []);

    const virtualizer = useVirtualizer({
        count: flatRows.length,
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
        <div className="flex flex-col max-h-[90vh] rounded-xl border border-border overflow-hidden bg-background shadow-sm">

            <div className="p-4 border-b border-border bg-card/30">
                <SalesDashboardFilters
                    activeSmartFilter={activeSmartFilterId}
                    onSmartFilter={toggleSmartFilter}
                    filterValues={filterValues}
                    onFilterChange={setFilterValue}
                    onFilterClear={clearFilter}
                    rows={allRows}
                />
            </div>

            <TableToolbar
                sort={sort}
                clearSort={clearSort}
                shrunken={shrink.shrunken}
                toggleShrink={shrink.toggle}
                visibility={colVis.visibility}
                toggleColumn={colVis.toggleColumn}
                resetVisibility={colVis.resetVisibility}
                totalRows={sortedRows.length}
                avgPeriod={avgPeriod}
                toggleAvgPeriod={toggleAvgPeriod}
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
                        avgPeriod={avgPeriod}
                    />

                    <TableBody>
                        {/* Top spacer: fills virtual space above rendered rows */}
                        {paddingTop > 0 && (
                            <tr aria-hidden style={{ height: paddingTop }}>
                                <td colSpan={colWidths.length} />
                            </tr>
                        )}

                        {virtualItems.map((vRow) => {
                            const flatRow = flatRows[vRow.index];

                            if (flatRow.kind === "sku") {
                                const { row } = flatRow;
                                return (
                                    <SalesTableRow
                                        key={`sku-${row.sku}`}
                                        row={row}
                                        index={vRow.index}
                                        isMonthShrunken={isMonthShrunken}
                                        colVis={colVis}
                                        isExpanded={expandedSkus.has(row.sku)}
                                        onToggle={() => toggleExpand(row.sku)}
                                        avgPeriod={avgPeriod}
                                        data-index={vRow.index}
                                        ref={virtualizer.measureElement}
                                    />
                                );
                            }

                            const { product, parentRow } = flatRow;
                            return (
                                <SalesProductRow
                                    key={`product-${product.productId}`}
                                    product={product}
                                    parentRow={parentRow}
                                    orderedMonths={orderedMonths}
                                    isMonthShrunken={isMonthShrunken}
                                    colVis={colVis}
                                    avgPeriod={avgPeriod}
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
