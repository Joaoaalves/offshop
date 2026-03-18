"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSuppliers } from "@/hooks/use-suppliers";

export function EditSupplierDialog({ supplier }: any) {
  const { updateSupplier, updatePending } = useSuppliers();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: supplier.name ?? "",
    prefix: supplier.prefix ?? "",
    leadTimeDays: supplier.leadTimeDays ?? 0,
    safetyDays: supplier.safetyDays ?? 0,
    active: supplier.active ?? true,
  });

  async function handleSave() {
    await updateSupplier({
      id: supplier._id,
      data: {
        ...form,
        prefix: form.prefix.trim().toUpperCase() || undefined,
      },
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prefix">
              Prefixo SKU
              <span className="ml-1 text-xs text-muted-foreground">(ex: POL, BUB)</span>
            </Label>
            <Input
              id="edit-prefix"
              className="font-mono uppercase"
              value={form.prefix}
              onChange={(e) =>
                setForm({ ...form, prefix: e.target.value.toUpperCase() })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lead">Tempo de Entrega (dias)</Label>
              <Input
                id="edit-lead"
                type="number"
                min={0}
                value={form.leadTimeDays}
                onChange={(e) =>
                  setForm({ ...form, leadTimeDays: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-safety">Dias de Segurança</Label>
              <Input
                id="edit-safety"
                type="number"
                min={0}
                value={form.safetyDays}
                onChange={(e) =>
                  setForm({ ...form, safetyDays: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="edit-active">Fornecedor ativo</Label>
            <Switch
              id="edit-active"
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updatePending}>
            {updatePending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
