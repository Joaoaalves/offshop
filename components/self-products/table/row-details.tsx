"use client";

import { cn } from "@/lib/utils";
import {
  Building2,
  Calculator,
  Layers,
  Package,
  Ruler,
} from "lucide-react";
import { toast } from "sonner";
import { useSelfProducts } from "@/hooks/use-self-products";
import { EditableRow } from "./editable-row";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 pb-1.5 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={
          highlight
            ? "text-xs font-semibold text-primary"
            : "text-xs font-medium text-foreground"
        }
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  className
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-4 shadow-lg shadow-black", className)}>
      <div className="mb-3 flex items-center gap-2 border-b pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  product: any;
  colSpan: number;
}

export function RowDetails({ product, colSpan }: Props) {
  const isKit = product.productType === "kit";
  const isCombo = product.productType === "combo";

  const { updateSelfProduct } = useSelfProducts();
  const productId: string = product._id ?? product.id;

  async function saveField(field: string, value: number | string | null) {
    try {
      await updateSelfProduct({ id: productId, data: { [field]: value } });
      toast.success("Campo atualizado.");
    } catch {
      toast.error("Erro ao atualizar campo.");
      throw new Error("save failed");
    }
  }

  return (
    <tr>
      <td colSpan={colSpan} className="border-b bg-muted/20 px-4 py-3">
        <div className="grid gap-3 md:grid-cols-3">

          <Card icon={Building2} title="Informações Básicas">
            <Row label="Fornecedor" value={product.supplier?.name} />
            <EditableRow
              label="NCM"
              displayValue={product.ncm ?? null}
              fieldName="ncm"
              rawValue={product.ncm ?? null}
              fieldType="text"
              onSave={saveField}
            />
            <EditableRow
              label="Un. por Caixa"
              displayValue={product.unitsPerBox != null ? String(product.unitsPerBox) : null}
              fieldName="unitsPerBox"
              rawValue={product.unitsPerBox ?? null}
              fieldType="number"
              step="1"
              onSave={saveField}
            />
            <EditableRow
              label="Min. Estoque"
              displayValue={product.minStockDays ? `${product.minStockDays} dias` : null}
              fieldName="minStockDays"
              rawValue={product.minStockDays ?? null}
              fieldType="number"
              step="1"
              onSave={saveField}
            />
            {isKit && (
              <Row label="Prod. Base" value={
                typeof product.parentProduct === "object"
                  ? `${product.parentProduct?.baseSku} — ${product.parentProduct?.name}`
                  : product.parentProduct ?? null
              } />
            )}
            {isKit && (
              <EditableRow
                label="Qtd. Kit"
                displayValue={product.kitQuantity ? `${product.kitQuantity}x` : null}
                fieldName="kitQuantity"
                rawValue={product.kitQuantity ?? null}
                fieldType="number"
                step="1"
                onSave={saveField}
              />
            )}
          </Card>

          <Card icon={Calculator} title="Preços">
            <EditableRow
              label="Custo (caixa)"
              displayValue={product.cost != null ? fmt(product.cost) : null}
              fieldName="cost"
              rawValue={product.cost ?? null}
              fieldType="number"
              step="0.01"
              onSave={saveField}
            />
            <Row
              label="Custo Unitário"
              value={product.cost != null && product.unitsPerBox ? fmt(product.cost / product.unitsPerBox) : null}
            />
            <Row
              label="ICMS"
              value={product.icms != null ? `${(product.icms ?? 0).toFixed(2)}%` : null}
            />
            <Row
              label="IPI"
              value={product.ipi != null ? `${(product.ipi ?? 0).toFixed(2)}%` : null}
            />
            <Row
              label="DIFAL"
              value={product.difal != null ? `${(product.difal ?? 0).toFixed(2)}%` : null}
            />
            <Row
              label="Custo Armaz."
              value={product.storageCost != null ? fmt(product.storageCost) : null}
            />
            <Row
              label="Custo Unit. c/ Impostos"
              value={product.priceWithTaxes != null ? fmt(product.priceWithTaxes) : null}
              highlight
            />
          </Card>

          <Card icon={Ruler} title="Dimensões e Peso">
            <EditableRow
              label="Comprimento"
              displayValue={product.lengthCm ? `${product.lengthCm} cm` : null}
              fieldName="lengthCm"
              rawValue={product.lengthCm ?? null}
              fieldType="number"
              step="0.0001"
              onSave={saveField}
            />
            <EditableRow
              label="Largura"
              displayValue={product.widthCm ? `${product.widthCm} cm` : null}
              fieldName="widthCm"
              rawValue={product.widthCm ?? null}
              fieldType="number"
              step="0.0001"
              onSave={saveField}
            />
            <EditableRow
              label="Altura"
              displayValue={product.heightCm ? `${product.heightCm} cm` : null}
              fieldName="heightCm"
              rawValue={product.heightCm ?? null}
              fieldType="number"
              step="0.0001"
              onSave={saveField}
            />
            <Row
              label="Volume"
              value={`${(product.lengthCm * product.widthCm * product.heightCm / 1000000).toFixed(3)} m³`}
            />
            <EditableRow
              label="Peso"
              displayValue={product.weightKg ? `${product.weightKg} kg` : null}
              fieldName="weightKg"
              rawValue={product.weightKg.toFixed(2) ?? null}
              fieldType="number"
              step="0.0001"
              onSave={saveField}
            />
            <EditableRow
              label="Peso Tarif."
              displayValue={product.chargeableWeightKg ? `${product.chargeableWeightKg} kg` : null}
              fieldName="chargeableWeightKg"
              rawValue={product.chargeableWeightKg.toFixed(2) ?? null}
              fieldType="number"
              step="0.001"
              onSave={saveField}
            />
          </Card>

          {isCombo && Array.isArray(product.components) && product.components.length > 0 && (
            <Card icon={Layers} title="Componentes" className="col-span-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {product.components.map((c: any, i: number) => {
                  const p = typeof c.product === "object" ? c.product : null;
                  if (!p) return null;
                  return (
                    <div
                      key={i}
                      className="flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm"
                    >
                      {/* Image */}
                      <div className="relative flex h-28 items-center justify-center bg-muted/40">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        )}
                        {/* Quantity badge */}
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                          {c.quantity}×
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col gap-1 p-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.baseSku}
                        </span>
                        <span className="line-clamp-2 text-xs font-medium leading-tight">
                          {p.name}
                        </span>
                        {p.priceWithTaxes != null ? (
                          <span className="mt-auto pt-1 text-xs font-semibold text-primary">
                            {fmt(p.priceWithTaxes)}
                          </span>
                        ) : p.cost != null && p.unitsPerBox ? (
                          <span className="mt-auto pt-1 text-xs font-semibold text-primary">
                            {fmt(p.cost / p.unitsPerBox)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
      </td>
    </tr>
  );
}

// Separate stock card if needed in the future — intentionally left as its own section
export function StockCard({ product }: { product: any }) {
  return (
    <Card icon={Package} title="Estoque">
      <Row label="Galpão" value={product.stock?.storage} />
      <Row label="A Caminho" value={product.stock?.incoming} />
      <Row label="Avaria" value={product.stock?.damage} />
    </Card>
  );
}
