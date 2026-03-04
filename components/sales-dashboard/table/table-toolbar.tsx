"use client";

import { useState, useRef, useEffect } from "react";
import {
    SortState,
    SortField,
    COLUMN_DEFS,
} from "@/hooks/tables/use-table-controls";
import { cn } from "@/lib/utils";
import {
    Columns3,
    X,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    RotateCcw,
    ChevronsLeftRight,
    ChevronsRightLeft,
    Eye,
    EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";



interface TableToolbarProps {
    sort: SortState;
    clearSort: () => void;
    shrunken: Set<string>;
    toggleShrink: (key: string) => void;
    visibility: Record<string, boolean>;
    toggleColumn: (key: string) => void;
    resetVisibility: () => void;
    totalRows: number;
}

// Group COLUMN_DEFS by their group label
const COL_GROUPS = Array.from(
    COLUMN_DEFS.reduce((acc, col) => {
        if (!acc.has(col.group)) acc.set(col.group, []);
        acc.get(col.group)!.push(col);
        return acc;
    }, new Map<string, typeof COLUMN_DEFS>())
);

export function TableToolbar({
    sort, clearSort, shrunken, toggleShrink,
    visibility, toggleColumn, resetVisibility, totalRows,
}: TableToolbarProps) {
    const hiddenCount = Object.values(visibility).filter((v) => !v).length;
    const isMonthShrunken = shrunken.has("sales-shrink-v1");

    return (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
            {/* LEFT — row count + active sort indicator */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                    <span className="font-semibold text-foreground">{totalRows.toLocaleString("pt-BR")}</span> produtos
                </span>

                {sort.field && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-[11px] font-medium">
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Ordenado por <strong>{sortFieldLabel(sort.field)}</strong></span>
                        {sort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <button onClick={clearSort} className="ml-0.5 hover:text-violet-800 transition-colors" aria-label="Limpar ordenação">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT — controls */}
            <div className="flex items-center gap-2">
                {/* Shrink toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleShrink("sales-shrink-v1")}
                    className={cn(
                        "h-8 text-[11px] gap-1.5",
                        !isMonthShrunken && "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:text-white dark:bg-slate-100 dark:text-slate-900"
                    )}
                >
                    {isMonthShrunken
                        ? <ChevronsLeftRight className="w-3.5 h-3.5" />
                        : <ChevronsRightLeft className="w-3.5 h-3.5" />
                    }
                    {isMonthShrunken ? "Mostrar detalhes logística" : "Ocultar detalhes logística"}
                </Button>

                {/* Column visibility — shadcn DropdownMenu + CheckboxItem */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("h-8 text-[11px] gap-1.5", hiddenCount > 0 && "border-indigo-400/50 text-indigo-600 bg-indigo-500/5")}
                        >
                            <Columns3 className="w-3.5 h-3.5" />
                            Colunas
                            {hiddenCount > 0 && (
                                <Badge className="h-4 px-1 text-[10px] bg-indigo-500 text-white border-0">
                                    {hiddenCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-xs font-semibold">Visibilidade</span>
                            <button
                                onClick={resetVisibility}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Resetar
                            </button>
                        </div>

                        {COL_GROUPS.map(([groupName, cols], i) => (
                            <div key={groupName}>
                                {i > 0 && <DropdownMenuSeparator />}
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-1">
                                    {groupName}
                                </DropdownMenuLabel>
                                {cols.map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col.key}
                                        checked={visibility[col.key] ?? true}
                                        onCheckedChange={() => toggleColumn(col.key)}
                                        className="text-xs"
                                    >
                                        {col.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </div>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortFieldLabel(field: SortField): string {
    const map: Record<SortField, string> = {
        productId: "MLB",
        sku: "SKU",
        abcCurve: "Curva",
        status: "Status",
        dailyAvgRevenue: "Média R$",
        dailyAvgUnits: "Média Un",
        totalRevenue: "Receita Total",
        totalUnits: "Unidades Total",
        conversion: "Conversão",
        availableQuantity: "Estoque Full",
    };
    return map[field] ?? field;
}