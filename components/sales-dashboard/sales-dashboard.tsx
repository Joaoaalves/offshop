import { SalesDashboardFilters } from "./filters/sales-dashboard-filter";
import SalesTable from "./table/sales-table";


export default function SalesDashboard() {

    return (
        <div className="overflow-x-auto">
            <SalesTable />
        </div>
    )
}