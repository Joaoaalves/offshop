import { Trend, Momentum } from "@/types/enums";

const DEFAULT_REGRESSION = {
  slope: 0,
  intercept: 0,
  r2: 0,
  slopePct: 0,
  avgRevenue: 0,
};

export const TrendProjection = {
  fields() {
    return {
      trend: { $ifNull: ["$trend", Trend.INSUFICIENT] },
      momentum: { $ifNull: ["$momentum", Momentum.STABLE] },
      earlySignal: { $ifNull: ["$earlySignal", null] },
      regression: { $ifNull: ["$regression", DEFAULT_REGRESSION] },
      conversionDropped: { $ifNull: ["$conversionDropped", false] },
      conversionDropPct: { $ifNull: ["$conversionDropPct", 0] },
    };
  },
};
