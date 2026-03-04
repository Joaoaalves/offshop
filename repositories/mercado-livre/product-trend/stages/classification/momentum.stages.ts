import { Momentum } from "@/types/enums";
import { PipelineStage } from "mongoose";

export const MomentumStages = {
  classify(): PipelineStage.AddFields {
    return {
      $addFields: {
        momentum: {
          $switch: {
            branches: [
              {
                case: {
                  $or: [{ $lte: ["$_rev_m1", 0] }, { $lte: ["$_rev_m0", 0] }],
                },
                then: Momentum.STABLE,
              },
              {
                case: {
                  $gt: ["$_rev_m0", { $multiply: ["$_rev_m1", 1.05] }],
                },
                then: Momentum.GROWING,
              },
              {
                case: {
                  $lt: ["$_rev_m0", { $multiply: ["$_rev_m1", 0.95] }],
                },
                then: Momentum.FALLING,
              },
            ],
            default: Momentum.STABLE,
          },
        },
        _full_momentum: {
          $switch: {
            branches: [
              {
                case: {
                  $or: [
                    { $lte: ["$_full_rev_m1", 0] },
                    { $lte: ["$_full_rev_m0", 0] },
                  ],
                },
                then: Momentum.STABLE,
              },
              {
                case: {
                  $gt: [
                    "$_full_rev_m0",
                    { $multiply: ["$_full_rev_m1", 1.05] },
                  ],
                },
                then: Momentum.GROWING,
              },
              {
                case: {
                  $lt: [
                    "$_full_rev_m0",
                    { $multiply: ["$_full_rev_m1", 0.95] },
                  ],
                },
                then: Momentum.FALLING,
              },
            ],
            default: Momentum.STABLE,
          },
        },
        _flex_momentum: {
          $switch: {
            branches: [
              {
                case: {
                  $or: [
                    { $lte: ["$_flex_rev_m1", 0] },
                    { $lte: ["$_flex_rev_m0", 0] },
                  ],
                },
                then: Momentum.STABLE,
              },
              {
                case: {
                  $gt: [
                    "$_flex_rev_m0",
                    { $multiply: ["$_flex_rev_m1", 1.05] },
                  ],
                },
                then: Momentum.GROWING,
              },
              {
                case: {
                  $lt: [
                    "$_flex_rev_m0",
                    { $multiply: ["$_flex_rev_m1", 0.95] },
                  ],
                },
                then: Momentum.FALLING,
              },
            ],
            default: Momentum.STABLE,
          },
        },
      },
    };
  },
};
