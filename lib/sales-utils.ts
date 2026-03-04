import { AbcCurve, AbcCurveChange, Trend } from "@/types/enums";
import { IMlProductBase } from "@/types/mercado-livre";
import { IMonthBucket, ISalesDashboardItem, SalesRow } from "@/types/sales";

// ─── Month helpers ────────────────────────────────────────────────────────────

export function getOrderedMonths(
  data: any[],
): { year: number; month: number }[] {
  const map = new Map<string, { year: number; month: number }>();
  data.forEach((row) =>
    row.months.forEach((m: IMonthBucket) => {
      const key = `${m.year}-${m.month}`;
      if (!map.has(key)) map.set(key, { year: m.year, month: m.month });
    }),
  );
  return [...map.values()].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );
}

/** Returns true if the product already existed during the given month. */
export function existed(month: Date, created: Date): boolean {
  const cYear = created.getFullYear();
  const mYear = month.getFullYear();
  if (cYear < mYear) return true;
  const cMonth = created.getMonth();
  const mMonth = month.getMonth();
  return cYear === mYear && cMonth <= mMonth;
}

// ─── Conversion ───────────────────────────────────────────────────────────────

export function calcConversion(month: IMonthBucket | null): number {
  if (!month) return 0;
  if (!month.total.orders || month.views === 0) return 0;
  return Math.min(100, month.conversionRate * 100);
}

// ─── Status ───────────────────────────────────────────────────────────────────

export function statusLabel(status: string): string {
  if (status === "active") return "Ativo";
  if (status === "paused") return "Pausado";
  return "Em Revisão";
}

export function statusVariant(
  status: string,
): "default" | "outline" | "secondary" {
  if (status === "active") return "default";
  if (status === "under_review") return "outline";
  return "secondary";
}

// ─── ABC curve ────────────────────────────────────────────────────────────────

export function abcToLetter(curve: AbcCurve): string {
  if (curve === AbcCurve.A) return "A";
  if (curve === AbcCurve.B) return "B";
  return "C";
}

export function abcVariant(
  curve: AbcCurve,
): "default" | "outline" | "secondary" {
  if (curve === AbcCurve.A) return "default";
  if (curve === AbcCurve.C) return "outline";
  return "secondary";
}

// ─── Row builder ──────────────────────────────────────────────────────────────

export function buildRows(
  data: any[],
  orderedMonths: { year: number; month: number }[],
): SalesRow[] {
  return data.map((row: any) => {
    const monthMap = new Map<string, IMonthBucket>();
    row.months.forEach((m: IMonthBucket) =>
      monthMap.set(`${m.year}-${m.month}`, m),
    );

    const resolvedMonths = orderedMonths.map(
      (m) =>
        monthMap.get(`${m.year}-${m.month}`) ?? {
          year: m.year,
          month: m.month,
          units: 0,
          revenue: 0,
          views: 0,
        },
    );

    const now = new Date();
    const currentMonth = monthMap.get(
      `${now.getFullYear()}-${now.getMonth() + 1}`,
    ) ?? {
      units: 0,
      revenue: 0,
      views: 0,
    };

    return { ...row, resolvedMonths, currentMonth };
  });
}

export const toTrendArray = (f: string[]) =>
  f.map((value) => Number(value) as Trend);

export const extractUnits = (
  p: ISalesDashboardItem<IMlProductBase>,
): number => {
  var reg = /^([0-9]+U-)/;
  const matches = p.sku.match(reg);
  if (matches) {
    const u = matches[0].replace("U-", "");
    return parseInt(u, 1);
  }
  return 1;
};

export const isDead = (p: ISalesDashboardItem<IMlProductBase>): boolean => {
  return !p.isNew && p.dailyAvg45.units === 0;
};

export function detectAbruptDrop(product: ISalesDashboardItem<IMlProductBase>) {
  const months = product.months;

  if (months.length < 4 || !isDead(product)) return false;

  const [m1, m2, m3, m4] = months.slice(0, 4).map((m) => m.total.items);

  // Evita ruído com volume muito baixo
  if (m1 + m2 + m3 < 20) return false;

  // Evita divisão por zero
  if (m1 <= 0 || m2 <= 0 || m3 <= 0) return false;

  // Inclinação média (reta entre m1 e m3)
  const slope = (m3 - m1) / 2;

  // Projeção esperada para o mês 4
  const expectedM4 = m3 + slope;

  // Desvio percentual
  const deviation = (m4 - expectedM4) / expectedM4;

  // Critério de queda abrupta
  return deviation < -0.35; // queda maior que 35%
}
