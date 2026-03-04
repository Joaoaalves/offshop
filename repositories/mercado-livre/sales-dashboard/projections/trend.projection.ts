import { Trend, Momentum } from "@/types/enums";

export const TrendProjection = {
  fields() {
    return {
      trend: { $ifNull: ["$_trend.trend", Trend.INSUFICIENT] },
      momentum: { $ifNull: ["$_trend.momentum", Momentum.STABLE] },
      earlySignal: { $ifNull: ["$_trend.earlySignal", null] },
      regression: {
        $ifNull: [
          "$_trend.regression",
          { slope: 0, intercept: 0, r2: 0, slopePct: 0, avgRevenue: 0 },
        ],
      },
      conversionDropped: { $ifNull: ["$_trend.conversionDropped", false] },
    };
  },
};
