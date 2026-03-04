import { PipelineStage } from "mongoose";

export const ConsolidateStages = {
  project(): PipelineStage.Project {
    return {
      $project: {
        _id: 0,
        productId: 1,
        sku: 1,
        name: 1,
        image: 1,
        link: 1,
        price: 1,
        status: 1,
        dateCreated: 1,
        logisticType: 1,
        itemRelation: 1,
        catalogListing: 1,
        availableQuantity: 1,
        isNew: 1,
        months: 1,
        totals: 1,
        dailyAvg45: 1,
      },
    };
  },

  persist(): PipelineStage.Merge {
    return {
      $merge: {
        into: "productbasecaches",
        on: "productId",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    };
  },
};
