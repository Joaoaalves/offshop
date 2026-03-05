import { PipelineStage } from "mongoose";

export const SupplierStages = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "internalproducts",
          let: {
            baseSku: {
              $let: {
                vars: {
                  r: {
                    $regexFind: {
                      input: "$sku",
                      regex: "^(?:\\d+U-)?(.+)$",
                    },
                  },
                },
                in: {
                  $arrayElemAt: ["$$r.captures", 0],
                },
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$baseSku", "$$baseSku"],
                },
              },
            },
          ],
          as: "internalProduct",
        },
      },
      {
        $unwind: { path: "$internalProduct", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "internalProduct.supplierId",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
    ];
  },
};
