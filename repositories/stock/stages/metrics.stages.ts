import { PipelineStage } from "mongoose";

export const MetricsStages = {
  ratios(
    marketPlaceDelay: number,
    extraBufferDays: number,
  ): PipelineStage.AddFields {
    return {
      $addFields: {
        fullOrdersRatio: {
          $cond: [
            { $gt: ["$_totalOrders", 0] },
            {
              $divide: [
                { $ifNull: ["$totalFulfillmentOrders45", 0] },
                "$_totalOrders",
              ],
            },
            0,
          ],
        },
        flexOrdersRatio: {
          $cond: [
            { $gt: ["$_totalOrders", 0] },
            {
              $divide: [
                { $ifNull: ["$totalFlexOrders45", 0] },
                "$_totalOrders",
              ],
            },
            0,
          ],
        },
        processingDays: {
          $add: [
            { $ifNull: ["$supplier.leadTimeDays", 0] },
            { $ifNull: ["$supplier.safetyDays", 0] },
            marketPlaceDelay,
            extraBufferDays,
          ],
        },
        targetStockDays: 45,
      },
    };
  },

  dailyDemand(): PipelineStage.AddFields {
    return {
      $addFields: {
        fullDailySales: {
          $cond: [
            { $gt: ["$fullOrdersRatio", 0] },
            { $multiply: ["$avgDailySales", "$fullOrdersRatio"] },
            0,
          ],
        },
        flexDailySales: {
          $cond: [
            { $gt: ["$flexOrdersRatio", 0] },
            { $multiply: ["$avgDailySales", "$flexOrdersRatio"] },
            0,
          ],
        },
      },
    };
  },
};
