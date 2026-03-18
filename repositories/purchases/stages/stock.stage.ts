import { PipelineStage } from "mongoose";

/**
 * Maps the SelfProduct's own stock fields into the purchases dashboard shape.
 * All three columns (galpão, a caminho, fulfillment) come from InternalProduct.stock.
 */
export const StockMapStage = {
  map(): PipelineStage.AddFields {
    return {
      $addFields: {
        stock: {
          storage: { $ifNull: ["$stock.storage", 0] },
          incoming: { $ifNull: ["$stock.incoming", 0] },
          fulfillment: { $ifNull: ["$stock.fulfillment", 0] },
        },
      },
    };
  },
};
