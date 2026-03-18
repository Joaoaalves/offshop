"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuppliers } from "@/hooks/use-suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const EMPTY = { name: "", prefix: "", leadTimeDays: 7, safetyDays: 0, active: true };

export default function CreateSupplierPage() {
  const { createSupplier, createPending } = useSuppliers();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createSupplier({
      ...form,
      prefix: form.prefix.trim().toUpperCase() || undefined,
      leadTimeDays: Number(form.leadTimeDays),
      safetyDays: Number(form.safetyDays),
    });
    router.push("/fornecedores");
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Criar Fornecedor</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prefix">
            Prefixo SKU
            <span className="ml-1 text-xs text-muted-foreground">(ex: POL, BUB)</span>
          </Label>
          <Input
            id="prefix"
            className="font-mono uppercase"
            value={form.prefix}
            onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leadTimeDays">Tempo de Entrega (dias)</Label>
            <Input
              id="leadTimeDays"
              type="number"
              min={0}
              value={form.leadTimeDays}
              onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safetyDays">Dias de Segurança</Label>
            <Input
              id="safetyDays"
              type="number"
              min={0}
              value={form.safetyDays}
              onChange={(e) => setForm({ ...form, safetyDays: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="active">Fornecedor ativo</Label>
          <Switch
            id="active"
            checked={form.active}
            onCheckedChange={(v) => setForm({ ...form, active: v })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createPending}>
            {createPending ? "Salvando..." : "Criar Fornecedor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
