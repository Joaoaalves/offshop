import { PipelineStage } from "mongoose";

export const BaseStages = {
  matchValid(): PipelineStage.Match {
    return {
      $match: {
        productId: { $exists: true, $ne: null },
        sku: { $ne: null },
      },
    };
  },
};
