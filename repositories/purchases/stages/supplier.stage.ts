import { PipelineStage } from "mongoose";

/**
 * Joins the Supplier document referenced by SelfProduct.supplier and
 * extracts name and leadTimeDays into top-level fields.
 */
export const SupplierStage = {
  lookup(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier",
          foreignField: "_id",
          as: "_supplier",
        },
      },
      {
        $addFields: {
          supplierName: {
            $ifNull: [{ $arrayElemAt: ["$_supplier.name", 0] }, "Sem Fornecedor"],
          },
          supplierLeadTimeDays: {
            $ifNull: [{ $arrayElemAt: ["$_supplier.leadTimeDays", 0] }, 0],
          },
        },
      },
    ];
  },
};
