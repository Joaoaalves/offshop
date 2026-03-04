import { calcConversion } from "@/lib/sales-utils"
import { TableCell } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"
import { formatMonthYear } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import { SalesRow } from "@/types/sales"

export function ConversionCell({ row }: { row: SalesRow }) {
    const conversion = calcConversion(row.currentMonth)

    return (
        <TableCell className="text-center py-3">
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 cursor-default">
                        <span
                            className={cn(
                                "text-xs font-semibold tabular-nums flex items-center gap-0.5",
                                conversion >= 2 && "text-amber-600",
                                conversion >= 5 && "text-emerald-600",
                                conversion < 2 && "text-red-500"
                            )}
                        >
                            {row.conversionDropped ? (
                                <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                            ) : row.currentMonth?.conversionRate && row.conversionDropPct < -15 ? (
                                <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                            ) : null}
                            {conversion.toFixed(2)}%
                        </span>
                        <div className="w-14 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    conversion >= 5
                                        ? "bg-emerald-500"
                                        : conversion >= 2
                                            ? "bg-amber-500"
                                            : "bg-red-400"
                                )}
                                style={{ width: `${Math.min(100, conversion * 10)}%` }}
                            />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <span>As conversões foram:</span>
                    <ol className="mt-1">
                        {row.months.map((m) => (
                            <li
                                key={`conv-${row.productId}-${m.month}-${m.year}`}
                                className="grid grid-cols-2 gap-4"
                            >
                                <span>{formatMonthYear(m.month, m.year)}</span>
                                <span>{(m.conversionRate * 100).toFixed(1)}%</span>
                            </li>
                        ))}
                    </ol>
                    <Badge variant="secondary" className="mt-2">
                        {row.conversionDropped
                            ? `Caiu: ${row.conversionDropPct.toFixed(1)}%`
                            : row.conversionDropPct < -15 && (row.currentMonth?.conversionRate ?? 0) > 0 ? `Subiu: ${(row.conversionDropPct * -1).toFixed(1)}%` : "Manteve"}
                    </Badge>
                </TooltipContent>
            </Tooltip>
        </TableCell >
    )
}