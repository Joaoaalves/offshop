import { existed } from "@/lib/sales-utils";
import { Fragment } from "react/jsx-runtime";
import { TableCell } from "@/components/ui/table";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { IMonthBucket } from "@/types/sales";


/**
 * Modos de exibição dos meses:
 *
 *  EXPANDED (isShrunken = false) — 4 colunas por mês:
 *    R$  |  Full  |  Flex  |  DropOff
 *
 *  SHRUNKEN (isShrunken = true) — 2 colunas por mês:
 *    R$  |  Total Un
 *
 * O número de <col> no colgroup em sales-table.tsx deve bater com isso.
 */
export const MONTH_COLS_EXPANDED = 4;  // R$ + Full + Flex + DropOff
export const MONTH_COLS_SHRUNKEN = 2;  // R$ + Total Un

export function MonthCells({
    resolvedMonths,
    dateCreated,
    isVisible,
    isShrunken,
}: {
    resolvedMonths: IMonthBucket[];
    dateCreated: Date;
    isVisible: (key: string) => boolean;
    isShrunken: boolean;
}) {
    return (
        <>
            {resolvedMonths.map((m, i) => {
                const key = `month-${m.year}-${m.month}`;
                if (!isVisible(key)) return null;

                const monthInit = new Date(m.year, m.month - 1, 1);
                const cDate = new Date(dateCreated);
                const exists = existed(monthInit, cDate);

                const revCell = (
                    <TableCell className="text-start tabular-nums text-[10px] py-3 border-l border-border">
                        {exists ? (
                            <div className="w-full flex items-center justify-between gap-x-1.5">
                                <span className="text-foreground/70">
                                    R$ {m.total?.revenue.toFixed(2)}
                                </span>
                                {i > 0 && m.total?.revenue > resolvedMonths[i - 1].total?.revenue && (
                                    <TrendingUp className="min-w-3 max-w-3 text-emerald-500" />
                                )}
                                {i > 0 && m.total?.revenue === resolvedMonths[i - 1].total?.revenue && (
                                    <Minus className="min-w-3 max-w-3 text-neutral-400" />
                                )}
                                {i > 0 && m.total?.revenue < resolvedMonths[i - 1].total?.revenue && (
                                    <TrendingDown className="min-w-3 max-w-3 text-red-500" />
                                )}
                            </div>
                        ) : (
                            <Minus className="w-3.5 h-3.5 text-muted-foreground/30" />
                        )}
                    </TableCell>
                );

                // ── SHRUNKEN: R$ + Total Un ─────────────────────────────
                if (isShrunken) {
                    return (
                        <Fragment key={key}>
                            {revCell}
                            <TableCell className="text-center tabular-nums text-[10px] py-3 border-r-2 border-border">
                                {exists
                                    ? <span className="text-foreground/70">{m.total.items}</span>
                                    : <Minus className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />
                                }
                            </TableCell>
                        </Fragment>
                    );
                }

                // ── EXPANDED: R$ + Full + Flex + DropOff ───────────────
                return (
                    <Fragment key={key}>
                        {revCell}
                        <TableCell className="text-center tabular-nums text-[10px] py-3 border-border">
                            {exists
                                ? <span className="text-foreground/70">{m?.fulfillment?.items ?? 0}</span>
                                : <Minus className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />
                            }
                        </TableCell>
                        <TableCell className="text-center tabular-nums text-[10px] py-3 border-border">
                            {exists
                                ? <span className="text-foreground/70">{m?.flex?.items ?? 0}</span>
                                : <Minus className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />
                            }
                        </TableCell>
                        <TableCell className="text-center tabular-nums text-[10px] py-3 border-r-2 border-border">
                            {exists
                                ? <span className="text-foreground/70">{m?.dropOff?.items ?? 0}</span>
                                : <Minus className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />
                            }
                        </TableCell>
                    </Fragment>
                );
            })}
        </>
    );
}
