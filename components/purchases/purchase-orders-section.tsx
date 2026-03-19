"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  PackageCheck,
  Clock,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { IPurchaseOrder } from "@/types/purchase-order";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Arrive dialog ────────────────────────────────────────────────────────────

function ArriveDialog({
  order,
  open,
  onOpenChange,
}: {
  order: IPurchaseOrder;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { markArrived, markingArrived } = usePurchaseOrders();
  const [dateValue, setDateValue] = useState(
    new Date().toISOString().slice(0, 10),
  );

  async function confirm() {
    try {
      await markArrived({ id: order._id, arrivedAt: dateValue });
      toast.success("Chegada confirmada. Lead time do fornecedor atualizado.");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao confirmar chegada.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar chegada</DialogTitle>
          <DialogDescription>
            Pedido de <span className="font-medium">{order.supplierName}</span>{" "}
            feito em {fmtDate(order.orderedAt)}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Data de chegada
            </label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={markingArrived}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={confirm}
            disabled={markingArrived || !dateValue}
            className="gap-1.5"
          >
            {markingArrived && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <CheckCheck className="h-3.5 w-3.5" />
            Confirmar chegada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order row ────────────────────────────────────────────────────────────────

const COL_SPAN = 8;

function OrderRow({ order }: { order: IPurchaseOrder }) {
  const [expanded, setExpanded] = useState(false);
  const [arriveOpen, setArriveOpen] = useState(false);
  const isPending = order.status === "pending";

  const totalCost = order.items.reduce(
    (sum, i) => sum + i.cost * i.quantity,
    0,
  );

  return (
    <>
      {/* ── Summary row ── */}
      <TableRow
        className={cn(
          "text-xs cursor-pointer select-none",
          !isPending && "opacity-60",
          expanded && "bg-muted/30",
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand chevron */}
        <TableCell className="py-2 pl-3 w-6">
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
              expanded && "rotate-90",
            )}
          />
        </TableCell>

        <TableCell className="py-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isPending
                ? "bg-yellow-400/15 text-yellow-700 dark:text-yellow-400"
                : "bg-green-500/15 text-green-700 dark:text-green-400",
            )}
          >
            {isPending ? (
              <Clock className="h-2.5 w-2.5" />
            ) : (
              <PackageCheck className="h-2.5 w-2.5" />
            )}
            {isPending ? "Aguardando" : "Chegou"}
          </span>
        </TableCell>

        <TableCell className="py-2 font-medium">{order.supplierName}</TableCell>

        <TableCell className="py-2 font-mono text-muted-foreground">
          {fmtDate(order.orderedAt)}
        </TableCell>

        <TableCell className="py-2 font-mono text-muted-foreground">
          {order.arrivedAt ? fmtDate(order.arrivedAt) : "—"}
        </TableCell>

        <TableCell className="py-2 text-center tabular-nums font-mono">
          {order.leadTimeDays != null ? (
            <span className="font-semibold">{order.leadTimeDays}d</span>
          ) : (
            "—"
          )}
        </TableCell>

        <TableCell className="py-2 text-center tabular-nums font-mono">
          {order.items.length}
        </TableCell>

        <TableCell className="py-2 text-right tabular-nums font-mono text-muted-foreground">
          {fmt(totalCost)}
        </TableCell>

        <TableCell
          className="py-2 pr-4 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          {isPending && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px]"
              onClick={() => setArriveOpen(true)}
            >
              <PackageCheck className="h-3 w-3" />
              Chegou
            </Button>
          )}
        </TableCell>
      </TableRow>

      {/* ── Expanded items ── */}
      {expanded && (
        <TableRow className={cn("hover:bg-transparent", !isPending && "opacity-60")}>
          <TableCell colSpan={COL_SPAN + 1} className="p-0">
            <div className="border-t border-border/40 bg-muted/20 px-10 py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="pb-1.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground w-36">
                      Cód. Fab.
                    </th>
                    <th className="pb-1.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
                      SKU
                    </th>
                    <th className="pb-1.5 text-right font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
                      Qtd.
                    </th>
                    <th className="pb-1.5 text-right font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
                      Custo unit.
                    </th>
                    <th className="pb-1.5 text-right font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.baseSku}
                      className="border-b border-border/20 last:border-0"
                    >
                      <td className="py-1.5 font-mono text-muted-foreground">
                        {item.manufacturerCode ?? "—"}
                      </td>
                      <td className="py-1.5 font-mono font-medium">
                        {item.baseSku}
                      </td>
                      <td className="py-1.5 text-right tabular-nums font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-1.5 text-right tabular-nums font-mono text-muted-foreground">
                        {fmt(item.cost)}
                      </td>
                      <td className="py-1.5 text-right tabular-nums font-mono font-medium">
                        {fmt(item.cost * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCell>
        </TableRow>
      )}

      {arriveOpen && (
        <ArriveDialog
          order={order}
          open={arriveOpen}
          onOpenChange={setArriveOpen}
        />
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PurchaseOrdersSection() {
  const { orders, isLoading } = usePurchaseOrders();

  const pending = orders.filter((o) => o.status === "pending");
  const arrived = orders.filter((o) => o.status === "arrived");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold tracking-tight">Pedidos</h2>
        {orders.length > 0 && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {pending.length} aguardando · {arrived.length} chegaram
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
          Nenhum pedido registrado. Execute um pedido para começar o tracking.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-6 bg-muted/20" />
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-28">
                    Status
                  </TableHead>
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Fornecedor
                  </TableHead>
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pedido em
                  </TableHead>
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Chegou em
                  </TableHead>
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                    Lead time
                  </TableHead>
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                    SKUs
                  </TableHead>
                  <TableHead className="h-8 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Total
                  </TableHead>
                  <TableHead className="h-8 pr-4 bg-muted/20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow key={order._id} order={order} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
