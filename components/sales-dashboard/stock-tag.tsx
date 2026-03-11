import { Trend } from "@/types/enums";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ISalesDashboardItem } from "@/types/sales";
import { detectAbruptDrop, isDead } from "@/lib/sales-utils";
import { cn } from "@/lib/utils";

interface StockTagProps {
  product: ISalesDashboardItem;
  /** Mostra badge "OK" quando o estoque está saudável (útil na coluna Recomendação) */
  showOk?: boolean;
}

export default function StockTag({ product, showOk = false }: StockTagProps) {
  const hasFulfillment = product.products.some(p => p.logisticType === "fulfillment");
  const totalFullStock = product.products.reduce((s, p) => s + (p.stock?.full ?? 0), 0);
  const totalStorageStock = product.stock?.storage?.stock ?? 0;

  if (product.status !== "active" && (totalFullStock + totalStorageStock) === 0) {
    return showOk ? null : undefined;
  }

  // ── Produto morto ─────────────────────────────────────────────────────────
  if (isDead(product)) {
    if (detectAbruptDrop(product)) {
      return (
        <TooltipTag
          text="Investigar"
          cls="bg-fuchsia-500/20 text-fuchsia-600 border-fuchsia-500/30"
          description="Esse SKU vinha bem e sumiu nos últimos 45 dias. Investigue."
        />
      );
    }
    return (
      <TooltipTag
        text="Queime"
        cls="bg-rose-500/20 text-rose-600 border-rose-500/30"
        description="Esse SKU não vendeu nos últimos 45 dias."
      />
    );
  }

  // ── Tendência de queda constante ─────────────────────────────────────────
  const isFalling = product.trend === Trend.CONSTANT_FALL
    && !product.isNew
    && product.totals.units >= 20;

  if (isFalling) {
    return (
      <TooltipTag
        text="Descontinuar"
        cls="bg-orange-500/20 text-orange-600 border-orange-500/30"
        description="Produto em queda constante — avaliar descontinuação."
      />
    );
  }

  // ── Sem fulfillment: verifica cobertura do galpão ─────────────────────────
  if (!hasFulfillment) {
    const storageCov = product.stock?.storage?.replenishment?.coverage ?? 999;
    const storageUnits = product.stock?.storage?.replenishment?.suggestedUnits ?? 0;

    if (totalStorageStock > 0 && storageCov < 15) {
      return (
        <TooltipTag
          text="⚠ Repor Galpão"
          cls="bg-red-500/20 text-red-600 border-red-500/30"
          description={`Galpão com ${storageCov.toFixed(0)} dias de cobertura. Reponha: ${storageUnits} un.`}
        />
      );
    }
    if (totalStorageStock > 0 && storageCov < 45) {
      return (
        <TooltipTag
          text="Repor Galpão"
          cls="bg-amber-500/20 text-amber-600 border-amber-500/30"
          description={`Galpão com ${storageCov.toFixed(0)} dias de cobertura. Reponha: ${storageUnits} un.`}
        />
      );
    }

    if (showOk) {
      return (
        <TooltipTag
          text="OK"
          cls="bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
          description="Estoque saudável."
        />
      );
    }
    return;
  }

  // ── Produto fulfillment: verifica cobertura Full ──────────────────────────
  const cov = product.stock?.fulfillment?.replenishment?.coverage ?? 0;
  const units = product.stock?.fulfillment?.replenishment?.suggestedUnits ?? 0;

  if (product.trend < Trend.STABLE) {
    if (cov > 120) {
      return (
        <TooltipTag
          text="Queime"
          cls="bg-orange-500/20 text-orange-600 border-orange-500/30"
          description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura.`}
        />
      );
    }
    if (cov > 45) {
      return (
        <TooltipTag
          text="Queime"
          cls="bg-amber-500/20 text-amber-600 border-amber-500/30"
          description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura.`}
        />
      );
    }
  } else {
    if (cov > 50) {
      return (
        <TooltipTag
          text="Acelere"
          cls="bg-sky-500/20 text-sky-600 border-sky-500/30"
          description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura.`}
        />
      );
    }
  }

  if (product.trend >= Trend.STABLE) {
    if (cov <= 0) {
      return (
        <TooltipTag
          text="Acabou"
          cls="bg-red-500/20 text-red-600 border-red-500/30"
          description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura. Reponha: ${units} unidades.`}
        />
      );
    }
    if (cov < 15) {
      return (
        <TooltipTag
          text="Repor"
          cls="bg-red-500/20 text-red-600 border-red-500/30"
          description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura. Reponha: ${units} unidades.`}
        />
      );
    }
    if (cov < 45) {
      return (
        <TooltipTag
          text="Repor"
          cls="bg-amber-500/20 text-amber-600 border-amber-500/30"
          description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura. Reponha: ${units} unidades.`}
        />
      );
    }
  }

  if (showOk) {
    return (
      <TooltipTag
        text="OK"
        cls="bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
        description="Estoque saudável."
      />
    );
  }
}

// ─── TooltipTag ───────────────────────────────────────────────────────────────
function TooltipTag({ text, description, cls }: {
  text: string;
  description: string;
  cls: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn("py-0 text-[10px] font-medium cursor-default border", cls)}
        >
          {text}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <span>{description}</span>
      </TooltipContent>
    </Tooltip>
  );
}
