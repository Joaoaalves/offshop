import {
  Building2,
  Calculator,
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
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
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
  return (
    <tr>
      <td colSpan={colSpan} className="border-b bg-muted/20 px-4 py-3">
        <div className="grid gap-3 md:grid-cols-3">

          <Card icon={Building2} title="Informações Básicas">
            <Row label="Fornecedor"    value={product.supplier?.name} />
            <Row label="NCM"           value={product.ncm} />
            <Row label="Un. por Caixa" value={product.unitsPerBox} />
            <Row label="Min. Estoque"  value={product.minStockDays ? `${product.minStockDays} dias` : null} />
          </Card>

          <Card icon={Calculator} title="Preços e Impostos">
            <Row label="Preço de Tabela"  value={product.tablePrice ? fmt(product.tablePrice) : null} />
            <Row label="ICMS"             value={product.icms != null ? `${product.icms}%` : null} />
            <Row label="IPI"              value={product.ipi != null ? `${product.ipi}%` : null} />
            <Row label="DIFAL"            value={product.difal != null ? `${product.difal}%` : null} />
            <Row label="Custo Armaz."     value={product.storageCost ? fmt(product.storageCost) : null} />
            <Row label="c/ Impostos"      value={product.priceWithTaxes ? fmt(product.priceWithTaxes) : null} highlight />
            <Row label="Preço Unitário"   value={product.unitPrice ? fmt(product.unitPrice) : null} highlight />
          </Card>

          <Card icon={Ruler} title="Dimensões e Peso">
            <Row label="Comprimento" value={product.lengthCm ? `${product.lengthCm} cm` : null} />
            <Row label="Largura"     value={product.widthCm ? `${product.widthCm} cm` : null} />
            <Row label="Altura"      value={product.heightCm ? `${product.heightCm} cm` : null} />
            <Row label="Volume"      value={product.volumeCm3 ? `${product.volumeCm3} cm³` : null} />
            <Row label="Peso"        value={product.weightKg ? `${product.weightKg} kg` : null} />
            <Row label="Peso Tarif." value={product.chargeableWeightKg ? `${product.chargeableWeightKg} kg` : null} />
          </Card>

        </div>
      </td>
    </tr>
  );
}

// Separate stock card if needed in the future — intentionally left as its own section
export function StockCard({ product }: { product: any }) {
  return (
    <Card icon={Package} title="Estoque">
      <Row label="Galpão"    value={product.stock?.storage} />
      <Row label="A Caminho" value={product.stock?.incoming} />
      <Row label="Avaria"    value={product.stock?.damage} />
    </Card>
  );
}
