import { PipelineStage } from "mongoose";

export const TrendJoin = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "producttrendcaches",
          localField: "productId",
          foreignField: "productId",
          as: "_trend",
        },
      },
      { $unwind: { path: "$_trend", preserveNullAndEmptyArrays: true } },
    ];
  },
};
