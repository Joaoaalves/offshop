import { PipelineStage } from "mongoose";

export const StockJoin = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "stockcaches",
          let: { productSku: "$sku" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $regexMatch: {
                    input: "$$productSku",
                    regex: "$baseSku",
                  },
                },
              },
            },
          ],
          as: "_stock",
        },
      },
      { $unwind: { path: "$_stock", preserveNullAndEmptyArrays: true } },
    ];
  },
};
