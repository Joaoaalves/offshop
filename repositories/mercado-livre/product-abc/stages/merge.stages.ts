import { PipelineStage } from "mongoose";

export const MergeStages = {
  persist(): PipelineStage.Merge {
    return {
      $merge: {
        into: "productabccaches",
        on: "productId",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    };
  },
};
