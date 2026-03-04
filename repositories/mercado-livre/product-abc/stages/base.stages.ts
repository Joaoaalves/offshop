import { PipelineStage } from "mongoose";

export const BaseStages = {
  projectRevenue(): PipelineStage.Project {
    return {
      $project: {
        _id: 0,
        productId: 1,
        totalRevenue: "$totals.revenue",
      },
    };
  },

  sortByRevenue(): PipelineStage.Sort {
    return { $sort: { totalRevenue: -1 } };
  },
};
