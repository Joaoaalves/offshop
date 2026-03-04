import { Trend } from "@/types/enums";
import { PipelineStage } from "mongoose";

export const TrendStages = {
  classify(): PipelineStage.AddFields {
    return {
      $addFields: {
        trend: {
          $switch: {
            branches: [
              {
                case: { $lt: ["$_nonzero_count", 2] },
                then: Trend.INSUFICIENT,
              },
              {
                case: {
                  $and: [{ $eq: ["$_rev_m0", 0] }, "$_had_sales_before"],
                },
                then: Trend.DISAPPEARED,
              },
              {
                case: {
                  $and: [{ $eq: ["$_rev_m0", 0] }, { $gt: ["$_rev_m1", 0] }],
                },
                then: Trend.DISAPPEARED,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_reg_r2", 0.3] },
                    { $gt: ["$_reg_slope_pct", 30] },
                  ],
                },
                then: Trend.SOARED,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_reg_r2", 0.3] },
                    { $gt: ["$_reg_slope_pct", 5] },
                  ],
                },
                then: Trend.GROWING,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_reg_r2", 0.3] },
                    { $lt: ["$_reg_slope_pct", -5] },
                  ],
                },
                then: Trend.CONSTANT_FALL,
              },
            ],
            default: Trend.STABLE,
          },
        },
        _full_trend: {
          $switch: {
            branches: [
              {
                case: { $lt: ["$_full_nonzero_count", 2] },
                then: Trend.INSUFICIENT,
              },
              {
                case: {
                  $and: [
                    { $eq: ["$_full_rev_m0", 0] },
                    "$_full_had_sales_before",
                  ],
                },
                then: Trend.DISAPPEARED,
              },
              {
                case: {
                  $and: [
                    { $eq: ["$_full_rev_m0", 0] },
                    { $gt: ["$_full_rev_m1", 0] },
                  ],
                },
                then: Trend.DISAPPEARED,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_full_reg_r2", 0.3] },
                    { $gt: ["$_full_reg_slope_pct", 30] },
                  ],
                },
                then: Trend.SOARED,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_full_reg_r2", 0.3] },
                    { $gt: ["$_full_reg_slope_pct", 5] },
                  ],
                },
                then: Trend.GROWING,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_full_reg_r2", 0.3] },
                    { $lt: ["$_full_reg_slope_pct", -5] },
                  ],
                },
                then: Trend.CONSTANT_FALL,
              },
            ],
            default: Trend.STABLE,
          },
        },
        _flex_trend: {
          $switch: {
            branches: [
              {
                case: { $lt: ["$_flex_nonzero_count", 2] },
                then: Trend.INSUFICIENT,
              },
              {
                case: {
                  $and: [
                    { $eq: ["$_flex_rev_m0", 0] },
                    "$_flex_had_sales_before",
                  ],
                },
                then: Trend.DISAPPEARED,
              },
              {
                case: {
                  $and: [
                    { $eq: ["$_flex_rev_m0", 0] },
                    { $gt: ["$_flex_rev_m1", 0] },
                  ],
                },
                then: Trend.DISAPPEARED,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_flex_reg_r2", 0.3] },
                    { $gt: ["$_flex_reg_slope_pct", 30] },
                  ],
                },
                then: Trend.SOARED,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_flex_reg_r2", 0.3] },
                    { $gt: ["$_flex_reg_slope_pct", 5] },
                  ],
                },
                then: Trend.GROWING,
              },
              {
                case: {
                  $and: [
                    { $gte: ["$_flex_reg_r2", 0.3] },
                    { $lt: ["$_flex_reg_slope_pct", -5] },
                  ],
                },
                then: Trend.CONSTANT_FALL,
              },
            ],
            default: Trend.STABLE,
          },
        },
      },
    };
  },
};
