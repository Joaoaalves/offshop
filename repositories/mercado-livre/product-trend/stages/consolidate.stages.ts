import { PipelineStage } from "mongoose";

export const ConsolidateStages = {
  project(): PipelineStage.Project {
    return {
      $project: {
        _id: 0,
        productId: 1,
        revenueSeries: 1,
        conversionSeries: 1,

        trend: 1,
        momentum: 1,
        earlySignal: 1,
        regression: {
          slope: "$_reg_slope",
          intercept: "$_reg_intercept",
          r2: "$_reg_r2",
          slopePct: "$_reg_slope_pct",
          avgRevenue: "$_reg_avg_y",
        },
        conversionDropped: 1,
        conversionDropPct: 1,

        fulfillment: {
          trend: "$_full_trend",
          momentum: "$_full_momentum",
          earlySignal: "$_full_earlySignal",
          regression: {
            slope: "$_full_reg_slope",
            intercept: "$_full_reg_intercept",
            r2: "$_full_reg_r2",
            slopePct: "$_full_reg_slope_pct",
            avgRevenue: "$_full_reg_avg_y",
          },
        },

        flex: {
          trend: "$_flex_trend",
          momentum: "$_flex_momentum",
          earlySignal: "$_flex_earlySignal",
          regression: {
            slope: "$_flex_reg_slope",
            intercept: "$_flex_reg_intercept",
            r2: "$_flex_reg_r2",
            slopePct: "$_flex_reg_slope_pct",
            avgRevenue: "$_flex_reg_avg_y",
          },
        },
      },
    };
  },
  persist(): PipelineStage.Merge {
    return {
      $merge: {
        into: "producttrendcaches",
        on: "productId",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    };
  },
};
