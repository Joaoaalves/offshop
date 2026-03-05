"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { MultiSelectFilter } from "../../../table/filters/simple/multi-select-filter";
import { ToggleFilter } from "../../../table/filters/simple/toggle-filter";
import { TextFilter } from "../../../table/filters/simple/text-filter";


import { SEARCH_FILTER, ABC_FILTER, STATUS_FILTER, FULL_FILTER, CATALOG_FILTER, NEW_FILTER } from "./filters";

type FilterBarProps = {
    values: Record<string, any>;
    onChange: (id: string, value: any) => void;
    onClear: (id: string) => void;
    className?: string;
};

export const SalesFilterBar = memo(function SimpleFilterBar({
    values,
    onChange,
    onClear,
    className,
}: FilterBarProps) {
    return (
        <div className={cn("flex flex-wrap items-end gap-4", className)}>
            <div className="w-100">
                <TextFilter
                    filter={SEARCH_FILTER}
                    value={values[SEARCH_FILTER.id]}
                    onChange={(val) => onChange(SEARCH_FILTER.id, val)}
                />
            </div>

            <div className="grid grid-cols-2 gap-x-2 border-l border-l-border pl-2">
                <MultiSelectFilter
                    filter={ABC_FILTER}
                    value={values[ABC_FILTER.id] || []}
                    onChange={(val) => onChange(ABC_FILTER.id, val)}
                />

                <MultiSelectFilter
                    filter={STATUS_FILTER}
                    value={values[STATUS_FILTER.id] || []}
                    onChange={(val) => onChange(STATUS_FILTER.id, val)}
                />

            </div>
            <div className="flex flex-col border-l border-l-border pl-2 gap-2">
                <span className="text-[10px]  font-semibold uppercase tracking-wider text-muted-foreground/70">Tipo de Anúncio</span>
                <div className="flex items-center gap-x-2">
                    <ToggleFilter
                        filter={FULL_FILTER}
                        value={values[FULL_FILTER.id]}
                        onChange={(val) => onChange(FULL_FILTER.id, val)}
                    />

                    <ToggleFilter
                        filter={CATALOG_FILTER}
                        value={values[CATALOG_FILTER.id]}
                        onChange={(val) => onChange(CATALOG_FILTER.id, val)}
                    />

                    <ToggleFilter
                        filter={NEW_FILTER}
                        value={values[NEW_FILTER.id]}
                        onChange={(val) => onChange(NEW_FILTER.id, val)}
                    />
                </div>
            </div>

        </div>
    );
});
