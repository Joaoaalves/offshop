import { PipelineStage } from "mongoose";
import { AbcCurve } from "@/types/enums";

export const CurveStages = {
  percentage(): PipelineStage.AddFields {
    return {
      $addFields: {
        abcCumulativePct: {
          $cond: [
            { $gt: ["$grandTotalRevenue", 0] },
            {
              $multiply: [
                { $divide: ["$cumulativeRevenue", "$grandTotalRevenue"] },
                100,
              ],
            },
            0,
          ],
        },
      },
    };
  },

  classify(): PipelineStage.AddFields {
    return {
      $addFields: {
        abcCurve: {
          $switch: {
            branches: [
              { case: { $lte: ["$abcCumulativePct", 80] }, then: AbcCurve.A },
              { case: { $lte: ["$abcCumulativePct", 95] }, then: AbcCurve.B },
            ],
            default: AbcCurve.C,
          },
        },
      },
    };
  },
};
