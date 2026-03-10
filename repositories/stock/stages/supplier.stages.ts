import { PipelineStage } from "mongoose";

export const SupplierStages = {
  lookup(): PipelineStage[] {
    return [
      // Join SelfProduct by baseSku (pipeline _id IS the baseSku after groupByBaseSku)
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
      // Inject physical stock from SelfProduct, overriding flexStock set in base stage
      {
        $addFields: {
          flexStock: { $ifNull: ["$internalProduct.stock.storage",  0] },
          incoming:  { $ifNull: ["$internalProduct.stock.incoming", 0] },
          damage:    { $ifNull: ["$internalProduct.stock.damage",   0] },
        },
      },
      // Join Supplier info
      {
        $lookup: {
          from: "suppliers",
          localField: "internalProduct.supplier",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
    ];
  },
};
