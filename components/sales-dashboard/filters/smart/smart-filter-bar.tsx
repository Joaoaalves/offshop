"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SmartFilter } from "@/hooks/tables/use-smart-filters"
import { SalesRow } from "@/types/sales"

type SalesSmartFilterBarProps<T> = {
    columnKey: string
    filters: SmartFilter<T>[]
    data?: T[]
    activeId: string | null
    onChange: (id: string) => void
    label?: string
    className?: string
}

export const SmartFilterBar = memo(function SmartFilterBar({
    columnKey,
    filters,
    data,
    activeId,
    onChange,
    label,
    className,
}: SalesSmartFilterBarProps<SalesRow>) {
    const counts = useMemo(() => {
        if (!data) return null
        const map: Record<string, number> = {}
        for (const sf of filters) {
            map[sf.id] = sf.filterFn ? data.filter(sf.filterFn).length : 0
        }
        return map
    }, [data, filters])

    return (
        <div className={cn("flex flex-col gap-2", className)}>

            <div className="flex flex-wrap gap-2">
                {filters.map((sf) => {
                    const active = activeId === sf.id
                    const Icon = sf.icon
                    const count = counts?.[sf.id]

                    return (
                        <Tooltip key={sf.id}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onChange(sf.id)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                                        active
                                            ? "border-primary bg-primary text-background"
                                            : "border-border bg-card text-muted-foreground hover:border-foreground/50"
                                    )}
                                >
                                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                                    <span>{sf.label}</span>
                                    {count !== undefined && (
                                        <span
                                            className={cn(
                                                "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                                                active
                                                    ? "bg-background/20 text-background"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>{sf.description}</span>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
        </div>
    )
}) as <T>(props: SalesSmartFilterBarProps<T>) => React.ReactElement