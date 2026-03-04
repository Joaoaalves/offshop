import { PipelineStage } from "mongoose";

export const WindowStages = {
  cumulative(): PipelineStage.SetWindowFields {
    return {
      $setWindowFields: {
        sortBy: { totalRevenue: -1 },
        output: {
          cumulativeRevenue: {
            $sum: "$totalRevenue",
            window: { documents: ["unbounded", "current"] },
          },
          grandTotalRevenue: {
            $sum: "$totalRevenue",
            window: { documents: ["unbounded", "unbounded"] },
          },
        },
      },
    };
  },
};
