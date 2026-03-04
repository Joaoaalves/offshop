import { PipelineStage } from "mongoose";

export const SupplierStages = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "internalproducts",
          localField: "_id",
          foreignField: "baseSku",
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
