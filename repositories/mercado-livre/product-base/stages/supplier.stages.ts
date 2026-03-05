import { PipelineStage } from "mongoose";

export const SupplierStages = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "internalproducts",
          localField: "sku",
          foreignField: "baseSku",
          as: "selfProduct",
        },
      },
      { $unwind: { path: "$selfProduct", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "suppliers",
          localField: "selfProduct.supplier",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
    ];
  },
};
