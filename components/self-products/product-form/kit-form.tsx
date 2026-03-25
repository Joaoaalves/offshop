"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelfProducts } from "@/hooks/use-self-products";
import { kitProductSchema } from "@/lib/self-product-schema";
import { generateKitSku } from "@/lib/sku-generator";
import { FormSection } from "./form-section";
import { ProductSearchCombobox } from "./product-search-combobox";

interface Props {
  onSuccess?: () => void;
}

export function KitForm({ onSuccess }: Props) {
  const { createSelfProduct, createPending } = useSelfProducts();

  const [parent, setParent]           = useState<any>(null);
  const [kitQuantity, setKitQuantity] = useState(2);
  const [name, setName]               = useState("");
  const [imageUrl, setImageUrl]       = useState("");
  const [minStockDays, setMinStockDays] = useState(30);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  // Auto-fill name when parent or quantity changes
  useEffect(() => {
    if (!parent) return;
    setName(`Kit ${kitQuantity}x ${parent.name}`);
  }, [parent, kitQuantity]);

  const generatedSku = parent ? generateKitSku(parent.baseSku, kitQuantity) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      productType:   "kit",
      baseSku:       generatedSku,
      name,
      parentProduct: parent?._id,
      kitQuantity,
      supplierId:    parent?.supplier?._id,
      imageUrl:      imageUrl || undefined,
      minStockDays,
    };

    const result = kitProductSchema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      toast.error("Corrija os campos destacados.");
      return;
    }

    await createSelfProduct(result.data);
    toast.success("Kit criado com sucesso!");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection title="Produto Base">
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Produto Simples *</Label>
            <ProductSearchCombobox
              value={parent?._id ?? null}
              onChange={setParent}
              filter={(p) => !p.productType || p.productType === "simples"}
              placeholder="Buscar produto base…"
            />
            {errors.parentProduct && (
              <p className="mt-1 text-xs text-destructive">{errors.parentProduct}</p>
            )}
          </div>

          <div className="max-w-xs">
            <Label className="mb-1.5 block text-sm font-medium">Quantidade no Kit *</Label>
            <Input
              type="number"
              min={2}
              value={kitQuantity}
              onChange={(e) => setKitQuantity(Number(e.target.value))}
            />
            {errors.kitQuantity && (
              <p className="mt-1 text-xs text-destructive">{errors.kitQuantity}</p>
            )}
          </div>

          {generatedSku && (
            <div className="rounded-lg bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">SKU Gerado</p>
              <p className="font-mono text-sm font-medium">{generatedSku}</p>
            </div>
          )}
        </div>
      </FormSection>

      {parent && (
        <FormSection title="Detalhes do Kit">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-sm font-medium">Nome *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block text-sm font-medium">URL da Imagem</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-sm font-medium">Fornecedor</Label>
              <Input value={parent.supplier?.name ?? "—"} disabled className="bg-muted" />
              <p className="mt-1 text-xs text-muted-foreground">Herdado do produto base</p>
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
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={createPending || !parent} size="lg">
          {createPending ? "Salvando..." : "Criar Kit"}
        </Button>
      </div>
    </form>
  );
}
