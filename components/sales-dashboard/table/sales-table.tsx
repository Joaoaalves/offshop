"use client";

import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import SalesTableHeader from "./sales-table-header";
import StockTableHeader from "./stock/stock-table-header";
import { useSalesDashboard } from "@/hooks/dashboard/use-sales-dashboard";
import { buildRows, getOrderedMonths } from "@/lib/sales-utils";
import { Table, TableBody } from "@/components/ui/table";
import { TableToolbar } from "./table-toolbar";
import { StockTableToolbar } from "./stock/stock-table-toolbar";
import { IMlSalesDashboardProduct, SalesRow } from "@/types/sales";
import { useTableControls } from "@/hooks/tables/use-table-controls";
import { useSmartFilters } from "@/hooks/tables/use-smart-filters";
import { useFilters } from "@/hooks/tables/use-filters";
import { smartFilters } from "../filters/smart/filters";
import { filters as simpleFilters } from "../filters/simple/filters";
import { COLUMN_DEFS, sortSalesRows, SortField } from "./sales-table-config";
import { STOCK_COLUMN_DEFS, STOCK_COL_W, sortStockRows, StockSortField } from "./stock/stock-table-config";
import { SalesTableRow } from "./sales-table-row";
import { SalesProductRow } from "./sales-product-row";
import { StockTableRow } from "./stock/stock-table-row";
import { StockProductRow } from "./stock/stock-product-row";
import { SalesDashboardFilters } from "../filters/sales-dashboard-filter";
import { BarChart2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";


// ─── FlatRow: discriminated union for virtualizer ─────────────────────────────
type FlatRow =
  | { kind: "sku";     row: SalesRow }
  | { kind: "product"; product: IMlSalesDashboardProduct; parentRow: SalesRow };

type ViewMode = "sales" | "stock";

// ─── Sales column widths ──────────────────────────────────────────────────────
const SALES_COL_W: Record<string, number> = {
  "col-sku":        220,
  "col-abc":         60,
  "col-status":      70,
  "col-avg-rev":     80,
  "col-avg-un":      50,
  "col-total-rev":   90,
  "col-total-un":    50,
  "col-stock-full":  50,
  "col-stock-flex":  50,
  "col-conversion": 100,
};


export default function SalesTable() {
  const { items } = useSalesDashboard();
  const parentRef = useRef<HTMLDivElement>(null);

  const [view, setView]           = useState<ViewMode>("sales");
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  const [avgPeriod, setAvgPeriod] = useState<30 | 45>(45);
  const toggleAvgPeriod           = useCallback(() => setAvgPeriod(p => p === 45 ? 30 : 45), []);

  // Ref to hold the pending SKU to scroll to after a view switch
  const pendingScrollSku = useRef<string | null>(null);

  // ── Base data ──────────────────────────────────────────────────────────────
  const { rows: allRows, orderedMonths } = useMemo(() => {
    if (!items) return { rows: [] as SalesRow[], orderedMonths: [] };
    const orderedMonths = getOrderedMonths(items);
    return { rows: buildRows(items, orderedMonths), orderedMonths };
  }, [items]);

  const { filterValues, setFilterValue, clearFilter } = useFilters<SalesRow>();
  const { activeSmartFilterId, toggleSmartFilter } = useSmartFilters();

  const data = useMemo(() => {
    let result = allRows;
    if (activeSmartFilterId) {
      const sf = smartFilters.find((f) => f.id === activeSmartFilterId);
      if (sf) result = result.filter(sf.filterFn);
    }
    Object.entries(filterValues).forEach(([id, value]) => {
      const filter = simpleFilters.find((f) => f.id === id);
      if (filter && value !== undefined && value !== "") {
        result = result.filter(item => filter.filterFn(item, value));
      }
    });
    return result;
  }, [allRows, activeSmartFilterId, filterValues]);

  // ── Sales table controls ────────────────────────────────────────────────────
  const salesControls = useTableControls<SalesRow, SortField>({
    data,
    columnDefs: COLUMN_DEFS,
    storageKeyPrefix: "sales-v1",
    sortFn: sortSalesRows,
    initialSort: { field: null, dir: "desc" },
  });
  const { sortedRows: salesSortedRows, sort: salesSort, toggleSort: toggleSalesSort, clearSort: clearSalesSort, shrink, colVis: salesColVis } = salesControls;

  // ── Stock table controls ────────────────────────────────────────────────────
  const stockControls = useTableControls<SalesRow, StockSortField>({
    data,
    columnDefs: STOCK_COLUMN_DEFS,
    storageKeyPrefix: "stock-v1",
    sortFn: sortStockRows,
    initialSort: { field: null, dir: "desc" },
  });
  const { sortedRows: stockSortedRows, sort: stockSort, toggleSort: toggleStockSort, clearSort: clearStockSort, colVis: stockColVis } = stockControls;

  // ── Active sorted rows (per view) ───────────────────────────────────────────
  const sortedRows = view === "sales" ? salesSortedRows : stockSortedRows;
  const isMonthShrunken = shrink.isShrunken("sales-shrink-v1");

  // ── Expand logic ────────────────────────────────────────────────────────────
  const toggleExpand = useCallback((sku: string) => {
    setExpandedSkus(prev => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  }, []);

  // ── Flat rows for virtualizer (shared across views) ─────────────────────────
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

  // ── View toggle — save first visible SKU, restore after render ─────────────
  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
    measureElement: useCallback((el: Element) => (el as HTMLElement).offsetHeight, []),
  });

  const handleToggleView = useCallback((next: ViewMode) => {
    if (next === view) return;
    const items = virtualizer.getVirtualItems();
    if (items.length > 0) {
      const fr = flatRows[items[0].index];
      pendingScrollSku.current = fr.kind === "sku" ? fr.row.sku : fr.parentRow.sku;
    }
    setView(next);
  }, [view, virtualizer, flatRows]);

  useEffect(() => {
    const sku = pendingScrollSku.current;
    if (!sku) return;
    pendingScrollSku.current = null;
    const idx = flatRows.findIndex(r =>
      r.kind === "sku" ? r.row.sku === sku : r.parentRow.sku === sku,
    );
    if (idx >= 0) virtualizer.scrollToIndex(idx, { align: "start" });
  }, [view, flatRows]);   // intentionally omit virtualizer to avoid stale closure issues

  // ── Column widths ───────────────────────────────────────────────────────────
  const salesColWidths = useMemo(() => {
    const w: number[] = [];
    for (const key of ["col-sku", "col-abc", "col-status"]) {
      if (salesColVis.isVisible(key)) w.push(SALES_COL_W[key]);
    }
    const showMonthRev = salesColVis.isVisible("col-month-rev");
    const showMonthUn  = salesColVis.isVisible("col-month-un");
    for (let i = 0; i < orderedMonths.length; i++) {
      if (showMonthRev) w.push(80);
      if (showMonthUn) {
        if (isMonthShrunken) w.push(40);
        else w.push(50, 50, 50);
      }
    }
    for (const key of ["col-avg-rev", "col-avg-un", "col-total-rev", "col-total-un", "col-stock-full", "col-stock-flex", "col-conversion"]) {
      if (salesColVis.isVisible(key)) w.push(SALES_COL_W[key]);
    }
    return w;
  }, [orderedMonths.length, isMonthShrunken, salesColVis]);

  const stockColWidths = useMemo(() => {
    return STOCK_COLUMN_DEFS
      .filter(col => stockColVis.isVisible(col.key))
      .map(col => STOCK_COL_W[col.key] ?? 80);
  }, [stockColVis]);

  const colWidths     = view === "sales" ? salesColWidths : stockColWidths;
  const tableMinWidth = colWidths.reduce((a, b) => a + b, 0);

  // ── Virtualizer output ──────────────────────────────────────────────────────
  const virtualItems = virtualizer.getVirtualItems();
  const totalHeight  = virtualizer.getTotalSize();
  const paddingTop   = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? totalHeight - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div className="flex flex-col max-h-[90vh] rounded-xl border border-border overflow-hidden bg-background shadow-sm">

      {/* ── View toggle ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0 border-b border-border/40">
        <div className="flex gap-0">
          <button
            onClick={() => handleToggleView("sales")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium rounded-t-md border border-b-0 transition-colors",
              view === "sales"
                ? "bg-background border-border text-foreground shadow-sm -mb-px z-10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Vendas
          </button>
          <button
            onClick={() => handleToggleView("stock")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium rounded-t-md border border-b-0 transition-colors",
              view === "stock"
                ? "bg-background border-border text-foreground shadow-sm -mb-px z-10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Estoque
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
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

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      {view === "sales" ? (
        <TableToolbar
          sort={salesSort}
          clearSort={clearSalesSort}
          shrunken={shrink.shrunken}
          toggleShrink={shrink.toggle}
          visibility={salesColVis.visibility}
          toggleColumn={salesColVis.toggleColumn}
          resetVisibility={salesColVis.resetVisibility}
          totalRows={sortedRows.length}
          avgPeriod={avgPeriod}
          toggleAvgPeriod={toggleAvgPeriod}
        />
      ) : (
        <StockTableToolbar
          sort={stockSort}
          clearSort={clearStockSort}
          visibility={stockColVis.visibility}
          toggleColumn={stockColVis.toggleColumn}
          resetVisibility={stockColVis.resetVisibility}
          totalRows={sortedRows.length}
        />
      )}

      {/* ── Scroll container ─────────────────────────────────────────────────── */}
      <div
        ref={parentRef}
        className="overflow-auto flex-1"
        style={{ height: "calc(100vh - 248px)" }}
      >
        <Table
          className="table-fixed border-separate border-spacing-0"
          style={{ minWidth: tableMinWidth }}
        >
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w, minWidth: w }} />
            ))}
          </colgroup>

          {view === "sales" ? (
            <SalesTableHeader
              orderedMonths={orderedMonths}
              sort={salesSort}
              onSort={toggleSalesSort}
              isMonthShrunken={isMonthShrunken}
              colVis={salesColVis}
              avgPeriod={avgPeriod}
            />
          ) : (
            <StockTableHeader
              sort={stockSort}
              onSort={toggleStockSort}
              colVis={stockColVis}
            />
          )}

          <TableBody>
            {paddingTop > 0 && (
              <tr aria-hidden style={{ height: paddingTop }}>
                <td colSpan={colWidths.length} />
              </tr>
            )}

            {virtualItems.map((vRow) => {
              const flatRow = flatRows[vRow.index];

              if (flatRow.kind === "sku") {
                const { row } = flatRow;

                if (view === "sales") {
                  return (
                    <SalesTableRow
                      key={`sku-${row.sku}`}
                      row={row}
                      index={vRow.index}
                      isMonthShrunken={isMonthShrunken}
                      colVis={salesColVis}
                      isExpanded={expandedSkus.has(row.sku)}
                      onToggle={() => toggleExpand(row.sku)}
                      avgPeriod={avgPeriod}
                      data-index={vRow.index}
                      ref={virtualizer.measureElement}
                    />
                  );
                }

                return (
                  <StockTableRow
                    key={`stock-sku-${row.sku}`}
                    row={row}
                    index={vRow.index}
                    colVis={stockColVis}
                    isExpanded={expandedSkus.has(row.sku)}
                    onToggle={() => toggleExpand(row.sku)}
                    data-index={vRow.index}
                    ref={virtualizer.measureElement}
                  />
                );
              }

              const { product, parentRow } = flatRow;

              if (view === "sales") {
                return (
                  <SalesProductRow
                    key={`product-${product.productId}`}
                    product={product}
                    parentRow={parentRow}
                    orderedMonths={orderedMonths}
                    isMonthShrunken={isMonthShrunken}
                    colVis={salesColVis}
                    avgPeriod={avgPeriod}
                    data-index={vRow.index}
                    ref={virtualizer.measureElement}
                  />
                );
              }

              return (
                <StockProductRow
                  key={`stock-product-${product.productId}`}
                  product={product}
                  parentRow={parentRow}
                  colVis={stockColVis}
                  data-index={vRow.index}
                  ref={virtualizer.measureElement}
                />
              );
            })}

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
