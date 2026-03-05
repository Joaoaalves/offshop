import { PipelineStage } from "mongoose";

export const MergeStage = {
  merge(): PipelineStage.Merge {
    return {
      $merge: {
        into: "salesdashboard",
        on: "sku",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    };
  },
};
