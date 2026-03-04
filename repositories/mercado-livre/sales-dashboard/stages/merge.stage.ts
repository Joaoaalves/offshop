import { PipelineStage } from "mongoose";

export const MergeStage = {
  merge(): PipelineStage.Merge {
    return {
      $merge: {
        into: "salesdashboard",
        on: "productId",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    };
  },
};
