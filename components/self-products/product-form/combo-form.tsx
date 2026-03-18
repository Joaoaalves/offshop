"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSelfProducts } from "@/hooks/use-self-products";
import { comboProductSchema } from "@/lib/self-product-schema";
import { generateComboSku } from "@/lib/sku-generator";
import { DimensionsSection } from "./dimensions-section";
import { FormSection } from "./form-section";
import { ProductSearchCombobox } from "./product-search-combobox";

type Supplier = { _id: string; name: string };

interface ComponentItem {
  productId: string;
  sku: string;
  label: string;
  quantity: number;
  priceWithTaxes: number;
}

interface Props {
  suppliers: Supplier[];
  onSuccess?: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const EMPTY_DIMS: Record<string, string> = {
  lengthCm: "", widthCm: "", heightCm: "",
  volumeM3: "", weightKg: "", storageCost: "0",
};

export function ComboForm({ suppliers, onSuccess }: Props) {
  const { createSelfProduct, createPending } = useSelfProducts();

  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [minStockDays, setMinStockDays] = useState(30);
  const [dims, setDims] = useState(EMPTY_DIMS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatedSku = useMemo(
    () => components.length >= 2 ? generateComboSku(components.map((c) => c.sku)) : "",
    [components],
  );

  const totalPrice = useMemo(
    () => components.reduce((sum, c) => sum + c.priceWithTaxes * c.quantity, 0),
    [components],
  );

  function addComponent(p: any) {
    if (!p) return;
    setComponents((prev) => [
      ...prev,
      {
        productId: p._id,
        sku: p.baseSku,
        label: `${p.baseSku} — ${p.name}`,
        quantity: 1,
        priceWithTaxes: p.priceWithTaxes ?? 0,
      },
    ]);
  }

  function updateQty(idx: number, qty: number) {
    setComponents((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, quantity: Math.max(1, qty) } : c)),
    );
  }

  function removeComponent(idx: number) {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dimsCoerced = Object.fromEntries(
      Object.entries(dims).map(([k, v]) => [k, v ? parseFloat(v) : undefined]),
    );

    const data = {
      productType: "combo",
      baseSku: generatedSku,
      name,
      components: components.map((c) => ({ product: c.productId, quantity: c.quantity })),
      supplierId: supplierId || undefined,
      imageUrl: imageUrl || undefined,
      storageCost: parseFloat(dims.storageCost) || 0,
      minStockDays,
      ...dimsCoerced,
    };

    const result = comboProductSchema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      toast.error("Corrija os campos destacados.");
      return;
    }

    await createSelfProduct(result.data);
    toast.success("Combo criado com sucesso!");
    onSuccess?.();
  }

  const excludeIds = components.map((c) => c.productId);
  const hasEnough = components.length >= 2;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection title="Produtos do Combo">
        <div className="space-y-3">
          {/* Add product row */}
          <ProductSearchCombobox
            value={null}
            onChange={addComponent}
            filter={(p) => !p.productType || p.productType === "simples"}
            exclude={excludeIds}
            placeholder="Buscar e adicionar produto…"
          />

          {/* Component list */}
          {components.length === 0 ? (
            <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
              Adicione pelo menos 2 produtos ao combo.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {components.map((c, idx) => (
                <div key={c.productId} className="flex items-center gap-3 px-3 py-2">
                  <span className="flex-1 truncate text-sm">{c.label}</span>
                  <div className="flex items-center gap-1.5">
                    <Label className="sr-only">Qtd</Label>
                    <Input
                      type="number"
                      min={1}
                      className="h-8 w-16 text-center tabular-nums"
                      value={c.quantity}
                      onChange={(e) => updateQty(idx, Number(e.target.value))}
                    />
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      × {fmt(c.priceWithTaxes)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeComponent(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* SKU + price preview */}
          {hasEnough && (
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground">SKU Gerado</p>
                <p className="font-mono text-sm font-medium">{generatedSku}</p>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground">Preço Total</p>
                <p className="text-sm font-semibold text-primary">{fmt(totalPrice)}</p>
              </div>
            </div>
          )}

          {errors.components && (
            <p className="text-xs text-destructive">{errors.components}</p>
          )}
        </div>
      </FormSection>

      {hasEnough && (
        <>
          <FormSection title="Detalhes do Combo">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-sm font-medium">Nome *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do combo"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-sm font-medium">URL da Imagem</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-sm font-medium">Fornecedor</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block text-sm font-medium">
                  Dias Mínimos de Estoque
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={minStockDays}
                  onChange={(e) => setMinStockDays(Number(e.target.value))}
                />
              </div>
            </div>
          </FormSection>

          <DimensionsSection
            values={dims}
            errors={errors}
            onChange={(k, v) => setDims((prev) => ({ ...prev, [k]: v }))}
          />
        </>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createPending || !hasEnough || !name.trim()}
          size="lg"
        >
          {createPending ? "Salvando..." : "Criar Combo"}
        </Button>
      </div>
    </form>
  );
}
