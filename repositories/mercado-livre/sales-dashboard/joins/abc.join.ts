import { PipelineStage } from "mongoose";

export const AbcJoin = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "productabccaches",
          localField: "productId",
          foreignField: "productId",
          as: "_abc",
        },
      },
      { $unwind: { path: "$_abc", preserveNullAndEmptyArrays: true } },
    ];
  },
};
