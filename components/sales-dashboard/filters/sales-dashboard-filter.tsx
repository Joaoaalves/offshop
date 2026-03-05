import { SmartFilterBar } from "./smart/smart-filter-bar";
import { SalesRow } from "@/types/sales";
import { smartFilters } from "./smart/filters";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { SalesFilterBar } from "./simple/filter-bar";

type SalesDashboardFiltersProps = {
    // Smart Filters
    activeSmartFilter: string | null;
    onSmartFilter: (id: string) => void;

    // Simple Filters
    filterValues: Record<string, any>;
    onFilterChange: (id: string, value: any) => void;
    onFilterClear: (id: string) => void;

    rows: SalesRow[];
}

export function SalesDashboardFilters({
    activeSmartFilter,
    onSmartFilter,
    filterValues,
    onFilterChange,
    onFilterClear,
    rows
}: SalesDashboardFiltersProps) {

    return (
        <div className="space-y-8">
            <Tabs defaultValue="tab-1">
                <TabsList>
                    <TabsTab value="tab-1">Filtros</TabsTab>
                    <TabsTab value="tab-2">Filtros Inteligentes</TabsTab>
                </TabsList>
                <TabsPanel value="tab-1">
                    <SalesFilterBar
                        values={filterValues}
                        onChange={onFilterChange}
                        onClear={onFilterClear}
                    />
                </TabsPanel>
                <TabsPanel value="tab-2">
                    <SmartFilterBar
                        columnKey="smartFilters"
                        label="Smart Filters"
                        activeId={activeSmartFilter}
                        onChange={onSmartFilter}
                        data={rows}
                        filters={smartFilters} />
                </TabsPanel>
            </Tabs>

        </div>
    )
}