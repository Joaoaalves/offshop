"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchases } from "@/hooks/use-purchases";
import { IPurchaseDashboardItem } from "@/types/purchases";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  items: IPurchaseDashboardItem[];
}

export function PurchasesActionBar({ items }: Props) {
  const { syncCosts, syncingCosts, executeOrder, executingOrder } = usePurchases();
  const [open, setOpen] = useState(false);
  const [executing, setExecuting] = useState(false);

  // Products with an order
  const orderItems = items.filter((i) => i.order && i.order > 0);

  // Products with a cost change
  const costItems = items.filter(
    (i) => i.newCost != null && i.newCost !== i.cost,
  );

  const hasActions = orderItems.length > 0 || costItems.length > 0;

  async function execute() {
    setExecuting(true);
    try {
      // ── Action 1: Generate TXT + create order + update incoming + rebuild ──
      if (orderItems.length > 0) {
        const lines = orderItems
          .map((i) => {
            const boxes =
              i.unitsPerBox > 1 ? i.order! / i.unitsPerBox : i.order!;
            return `${i.manufacturerCode ?? i.baseSku} - ${boxes}`;
          })
          .join("\n");
        const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pedido_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        await executeOrder({
          supplierName: orderItems[0].supplierName,
          items: orderItems.map((i) => ({
            baseSku: i.baseSku,
            manufacturerCode: i.manufacturerCode,
            quantity: i.order!,
            cost: i.newCost ?? i.cost,
          })),
        });
      }

      // ── Action 2: Atualizar Tiny (placeholder) ────────────────────────────
      // TODO: integrate Tiny stock update

      // ── Action 3: Sync costs ───────────────────────────────────────────────
      if (costItems.length > 0) {
        const results = await syncCosts();
        const failed = (results as { ok: boolean; baseSku: string }[]).filter(
          (r) => !r.ok,
        );
        if (failed.length > 0) {
          toast.error(
            `${failed.length} custo(s) não foram atualizados. Verifique o console.`,
          );
        }
      }

      toast.success("Ações executadas com sucesso.");
      setOpen(false);
    } catch {
      toast.error("Erro ao executar ações.");
    } finally {
      setExecuting(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        disabled={!hasActions}
        className="h-8 gap-1.5 text-xs"
      >
        <Zap className="h-3.5 w-3.5" />
        Executar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar ações</DialogTitle>
            <DialogDescription>
              Revise todas as alterações antes de confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto">
            {/* Pedido de compra */}
            {orderItems.length > 0 ? (
              <section>
                <p className="mb-1.5 font-semibold">
                  Pedido de compra — {orderItems.length} produto
                  {orderItems.length !== 1 ? "s" : ""}
                </p>
                <ul className="space-y-0.5 text-xs text-muted-foreground pl-3">
                  {orderItems.map((i) => {
                    const boxes =
                      i.unitsPerBox > 1 ? i.order! / i.unitsPerBox : i.order!;
                    return (
                      <li key={i.baseSku} className="font-mono">
                        {i.manufacturerCode ?? i.baseSku} —{" "}
                        {boxes} cx.{i.unitsPerBox > 1 && ` (${i.order} un.)`}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground">
                  Será gerado um arquivo <code>.txt</code> para download.
                </p>
              </section>
            ) : (
              <p className="text-xs text-muted-foreground">
                📋 Nenhum pedido registrado.
              </p>
            )}

            <hr />

            {/* Tiny (placeholder) */}
            <section>
              <p className="font-semibold text-muted-foreground">
                Atualização Tiny
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pendente de implementação.
              </p>
            </section>

            <hr />

            {/* Custos */}
            {costItems.length > 0 ? (
              <section>
                <p className="mb-1.5 font-semibold">
                  Atualização de custos — {costItems.length} produto
                  {costItems.length !== 1 ? "s" : ""}
                </p>
                <ul className="space-y-0.5 text-xs pl-3">
                  {costItems.map((i) => (
                    <li key={i.baseSku} className="font-mono text-muted-foreground">
                      {i.baseSku}:{" "}
                      <span className="text-foreground">
                        {fmt(i.cost)} → {fmt(i.newCost!)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground">
                  O custo será atualizado no produto e sincronizado com a planilha.
                </p>
              </section>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhuma alteração de custo.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={executing || syncingCosts || executingOrder}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={execute}
              disabled={executing || syncingCosts || executingOrder || !hasActions}
              className="gap-1.5"
            >
              {(executing || syncingCosts || executingOrder) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
