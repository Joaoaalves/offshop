import {
  Anchor,
  BadgePlus,
  ClockAlert,
  Eye,
  EyeClosed,
  PackageMinus,
  PackageX,
  RefreshCcw,
  Rocket,
  Search,
  Skull,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AbcCurve, Momentum, Trend } from "@/types/enums";
import { SalesRow } from "@/types/sales";
import { SmartFilter } from "@/hooks/tables/use-smart-filters";
import {
  conversionFalling,
  conversionGrowing,
  fastGrowing,
  highRevLowConv,
  isRecovering,
  momentumGrowing,
  trendFalling,
  trendGrowing,
} from "@/lib/sales";
import { detectAbruptDrop, isDead } from "@/lib/sales-utils";

export const smartFilters: SmartFilter<SalesRow>[] = [
  {
    id: "growing",
    label: "Em Crescimento",
    description: "Produtos com tendencia de crescimento.",
    icon: TrendingUp,
    filterFn: (row: SalesRow) => trendGrowing(row),
    sort: (a, b) =>
      b.regression.slope * (1 - a.regression.r2) -
      a.regression.slope * (1 - b.regression.r2),
  },
  {
    id: "growing-fast",
    label: "Crescimento Acelerado",
    description: "Produtos com tendencia de crescimento acelerado.",
    icon: Rocket,
    filterFn: (row: SalesRow) => fastGrowing(row),
    sort: (a, b) => b.dailyAvg45.units - a.dailyAvg45.units,
  },
  {
    id: "falling",
    label: "Queda Constante",
    description: "Produtos com tendencia de queda constante.",
    icon: TrendingDown,
    filterFn: (row: SalesRow) => row.status === "active" && trendFalling(row),
    sort: (a, b) =>
      b.regression.slope * (1 - a.regression.r2) -
      a.regression.slope * (1 - b.regression.r2),
  },
  {
    id: "stable",
    label: "Estáveis",
    description: "Produtos confiáveis, sem muita variação de venda.",
    icon: Anchor,
    filterFn: (row: SalesRow) =>
      row.status === "active" &&
      row.trend === Trend.STABLE &&
      row.momentum === Momentum.STABLE,
    sort: (a, b) =>
      a.regression.slope * (1 - a.regression.r2) -
      b.regression.slope * (1 - b.regression.r2),
  },
  {
    id: "low-stock",
    label: "Baixo Estoque (Full)",
    description:
      "Produtos Fulfillment que provavelmente terão ruptura de estoque.",
    icon: PackageX,
    filterFn: (row: SalesRow) =>
      row.logisticType === "fulfillment" &&
      row.status === "active" &&
      row.dailyAvg45.units > 0 &&
      row.trend >= Trend.STABLE &&
      row.stock.fulfillment.replenishment.coverage < 45,
    sort: (a, b) =>
      a.stock.fulfillment.replenishment.coverage -
      b.stock.fulfillment.replenishment.coverage,
  },
  {
    id: "high-stock",
    label: "Sobre-estoque (Full)",
    description:
      "Produtos Fulfillment com mais de 45 dias de estoque(Utiliza média de venda diária dos últimos 45 dias).",
    icon: PackageMinus,
    filterFn: (row: SalesRow) =>
      row.logisticType === "fulfillment" &&
      row.status === "active" &&
      row.trend < Trend.STABLE &&
      row.stock.fulfillment.replenishment.coverage >= 60,
    sort: (a, b) =>
      b.stock.fulfillment.replenishment.coverage -
      a.stock.fulfillment.replenishment.coverage,
  },
  {
    id: "dead-products",
    label: "Produtos Mortos",
    description: "Produtos ativos, que estão há 45 dias sem vendas",
    icon: Skull,
    filterFn: (row: SalesRow) =>
      row.status === "active" && isDead(row) && !detectAbruptDrop(row),
    sort: (a, b) => a.totals.orders - b.totals.orders,
  },
  {
    id: "missing-products",
    label: "Produtos que Sumiram",
    description: "Produtos que vinham bem, mas estão há 45 dias sem vendas",
    icon: Search,
    filterFn: (row: SalesRow) => detectAbruptDrop(row),
  },
  {
    id: "losing-conversion",
    label: "Perdendo Conversão",
    description: "Produtos com perda de conversão.",
    icon: EyeClosed,
    filterFn: (row: SalesRow) => conversionFalling(row),
    sort: (a, b) =>
      (a.currentMonth?.conversionRate ?? 0) -
      (b.currentMonth?.conversionRate ?? 0),
  },
  {
    id: "growing-conversion",
    label: "Ganhando Conversão",
    description: "Produtos com ganho de conversão.",
    icon: Eye,
    filterFn: (row: SalesRow) => conversionGrowing(row),
    sort: (a, b) =>
      (b.currentMonth?.conversionRate ?? 0) -
      (a.currentMonth?.conversionRate ?? 0),
  },
  {
    id: "high-rev-low-conv",
    label: "Alta receita, baixa conversão",
    description: "Produtos curva A, que estão com baixa conversão",
    icon: ClockAlert,
    filterFn: (row: SalesRow) => highRevLowConv(row),
    sort: (a, b) =>
      (a.currentMonth?.conversionRate ?? 0) -
      (b.currentMonth?.conversionRate ?? 0),
  },
  {
    id: "good-news",
    label: "Bons novos",
    description: "Produtos novos que estão em crescimento.",
    icon: BadgePlus,
    filterFn: (row: SalesRow) =>
      row.isNew &&
      row.totals.units > 10 &&
      trendGrowing(row) &&
      momentumGrowing(row),
    sort: (a, b) => b.totals?.revenue - a.totals?.revenue,
  },
  {
    id: "recovering",
    label: "Em recuperação",
    description:
      "Produtos que vinham em queda, mas cresceram em vendas neste mês.",
    icon: RefreshCcw,
    filterFn: (row: SalesRow) => isRecovering(row),
  },
];
