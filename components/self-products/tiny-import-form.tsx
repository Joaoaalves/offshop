"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface Props {
  onSuccess?: () => void;
}

export function TinyImportForm({ onSuccess }: Props) {
  const [tinyId, setTinyId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = tinyId.trim();
    if (!id) return;

    setLoading(true);
    try {
      const result = await api<{ baseSku: string; productType: string }>(
        "/api/self-products/import-tiny",
        { method: "POST", body: JSON.stringify({ tinyId: id }) },
      );
      toast.success(`Produto importado: ${result.baseSku}`);
      setTinyId("");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao importar produto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tiny-id">ID do produto no Tiny ERP</Label>
        <Input
          id="tiny-id"
          placeholder="Ex: 123456789"
          value={tinyId}
          onChange={(e) => setTinyId(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Encontre o ID na URL do produto no Tiny: .../produto/<strong>ID</strong>
        </p>
      </div>

      <Button type="submit" disabled={loading || !tinyId.trim()}>
        {loading ? "Importando…" : "Importar"}
      </Button>
    </form>
  );
}
