import { AbcCurve, Momentum, Trend } from "@/types/enums";
import { SalesRow } from "@/types/sales";

export const trendGrowing = (row: SalesRow) => {
  if (detectStockBurn(row) || (!row.isNew && row.totals.units < 20))
    return false;

  return [Trend.GROWING, Trend.SOARED].includes(row.trend);
};

export const trendFalling = (row: SalesRow) => {
  if (!row.isNew && row.totals.units < 20) return false;

  return row.trend === Trend.CONSTANT_FALL;
};

export const momentumGrowing = (row: SalesRow) => {
  return [row.momentum, row.earlySignal].includes(Momentum.GROWING);
};

export const fastGrowing = (row: SalesRow) => {
  if (row.totals.units <= 10) return false;

  if (detectStockBurn(row) || (!row.isNew && row.totals.units < 20))
    return false;

  return (
    row.trend === Trend.SOARED &&
    (row.momentum >= Momentum.STABLE ||
      (row?.earlySignal ?? Momentum.STABLE) >= Momentum.STABLE) &&
    row.regression.slope > 0
  );
};

export const conversionGrowing = (row: SalesRow) => {
  const currentMonth = row.currentMonth;

  if (!currentMonth || row.status !== "active") return false;

  if (!currentMonth.conversionRate) return false;

  if (row.conversionDropPct > 0) return false;

  return !row.conversionDropped;
};

export const conversionFalling = (row: SalesRow) => {
  const currentMonth = row.currentMonth;

  if (!currentMonth || row.status !== "active") return false;

  if (!currentMonth.conversionRate || currentMonth.views === 0) return false;

  if (row.conversionDropPct > 0) return true;

  return row.conversionDropped;
};

export const highRevLowConv = (row: SalesRow) => {
  if (row.status !== "active") return false;
  if (row.abcCurve !== AbcCurve.A) return false;
  if (!row.currentMonth || row.currentMonth.views === 0) return false;

  if (row.currentMonth.conversionRate <= 0.05) return true;

  return false;
};

export const isRecovering = (row: SalesRow) => {
  if (row.status !== "active") return false;

  if (detectStockBurn(row)) return false;

  return trendFalling(row) && row.earlySignal === Momentum.GROWING;
};

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]) {
  const m = mean(arr);
  const variance =
    arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

export function detectStockBurn(product: SalesRow): boolean {
  const { months } = product;

  if (!months || months.length < 5) return false;

  for (let i = 3; i < months.length; i++) {
    const current = months[i];
    if (current.total.items === 0) continue;

    const baseline = months.slice(i - 3, i);

    const unitsArr = baseline.map((m) => m.total.items);
    const revenueArr = baseline.map((m) => m.total?.revenue);
    const convArr = baseline.map((m) => m.conversionRate);
    const priceArr = baseline.map((m) =>
      m.total.items > 0 ? m.total?.revenue / m.total.items : 0,
    );

    const avgUnits = mean(unitsArr);
    const avgRevenue = mean(revenueArr);
    const avgConv = mean(convArr);
    const avgPrice = mean(priceArr);

    const stdUnits = std(unitsArr);
    const stdPrice = std(priceArr);

    const currentPrice = current.total?.revenue / current.total.items;

    const unitsGrowthPct =
      avgUnits > 0 ? (current.total.items - avgUnits) / avgUnits : 0;

    const revenueGrowthPct =
      avgRevenue > 0 ? (current.total?.revenue - avgRevenue) / avgRevenue : 0;

    const priceDropPct =
      avgPrice > 0 ? (currentPrice - avgPrice) / avgPrice : 0;

    const convGrowthPct =
      avgConv > 0 ? (current.conversionRate - avgConv) / avgConv : 0;

    const zUnits =
      stdUnits > 0 ? (current.total.items - avgUnits) / stdUnits : 0;

    const zPrice = stdPrice > 0 ? (currentPrice - avgPrice) / stdPrice : 0;

    let score = 0;

    if (priceDropPct <= -0.15) score += 2;

    if (unitsGrowthPct >= 0.35) score += 2;

    if (zUnits >= 1.8) score += 1;
    if (zPrice <= -1.5) score += 1;

    if (unitsGrowthPct > revenueGrowthPct) score += 1;

    if (convGrowthPct >= 0.2) score += 1;

    if (i + 1 < months.length) {
      const next = months[i + 1];
      if (
        next.total.items < current.total.items * 0.75 &&
        next.total?.revenue < current.total?.revenue * 0.85
      ) {
        score += 1;
      }
    }

    if (score >= 6) {
      return true;
    }
  }

  return false;
}
