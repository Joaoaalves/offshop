import { cn } from "@/lib/utils";
import {
  Building2,
  Calculator,
  Layers,
  Package,
  Ruler,
} from "lucide-react";

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

  return (
    <tr>
      <td colSpan={colSpan} className="border-b bg-muted/20 px-4 py-3">
        <div className="grid gap-3 md:grid-cols-3">

          <Card icon={Building2} title="Informações Básicas" >
            <Row label="Fornecedor" value={product.supplier?.name} />
            <Row label="NCM" value={product.ncm} />
            <Row label="Un. por Caixa" value={product.unitsPerBox} />
            <Row label="Min. Estoque" value={product.minStockDays ? `${product.minStockDays} dias` : null} />
            {isKit && (
              <Row label="Prod. Base" value={
                typeof product.parentProduct === "object"
                  ? `${product.parentProduct?.baseSku} — ${product.parentProduct?.name}`
                  : product.parentProduct ?? null
              } />
            )}
            {isKit && (
              <Row label="Qtd. Kit" value={product.kitQuantity ? `${product.kitQuantity}x` : null} />
            )}
          </Card>

          <Card icon={Calculator} title="Preços e Impostos">
            <Row label="Preço de Tabela" value={product.tablePrice ? fmt(product.tablePrice) : null} />
            <Row label="ICMS" value={product.icms != null ? `${product.icms}%` : null} />
            <Row label="IPI" value={product.ipi != null ? `${product.ipi}%` : null} />
            <Row label="DIFAL" value={product.difal != null ? `${product.difal}%` : null} />
            <Row label="Custo Armaz." value={product.storageCost ? fmt(product.storageCost) : null} />
            <Row label="c/ Impostos" value={product.priceWithTaxes ? fmt(product.priceWithTaxes) : null} highlight />
            <Row label="Preço Unitário" value={product.unitPrice ? fmt(product.unitPrice) : null} highlight />
          </Card>

          <Card icon={Ruler} title="Dimensões e Peso">
            <Row label="Comprimento" value={product.lengthCm ? `${product.lengthCm} cm` : null} />
            <Row label="Largura" value={product.widthCm ? `${product.widthCm} cm` : null} />
            <Row label="Altura" value={product.heightCm ? `${product.heightCm} cm` : null} />
            <Row label="Volume" value={`${(product.lengthCm * product.widthCm * product.heightCm / 1000000).toFixed(3)} m³`} />
            <Row label="Peso" value={product.weightKg ? `${product.weightKg} kg` : null} />
            <Row label="Peso Tarif." value={product.chargeableWeightKg ? `${product.chargeableWeightKg} kg` : null} />
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
                        {p.unitPrice != null ? (
                          <span className="mt-auto pt-1 text-xs font-semibold text-primary">
                            {fmt(p.unitPrice)}
                          </span>
                        ) : p.tablePrice != null ? (
                          <span className="mt-auto pt-1 text-xs font-semibold text-primary">
                            {fmt(p.tablePrice)}
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
