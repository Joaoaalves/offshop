import { PipelineStage } from "mongoose";

export const StockStages = {
  coverage(): PipelineStage.AddFields {
    return {
      $addFields: {
        fullCoverageDays: {
          $cond: [
            { $gt: ["$fullDailySales", 0] },
            { $divide: ["$fullStock", "$fullDailySales"] },
            { $cond: [{ $gt: ["$fullStock", 0] }, 999, 0] },
          ],
        },
        flexCoverageDays: {
          $cond: [
            { $gt: ["$flexDailySales", 0] },
            { $divide: ["$flexStock", "$flexDailySales"] },
            { $cond: [{ $gt: ["$flexStock", 0] }, 999, 0] },
          ],
        },
      },
    };
  },

  replenishment(): PipelineStage.AddFields {
    return {
      $addFields: {
        fullReplenishmentDays: {
          $max: [
            0,
            {
              $subtract: [
                { $add: ["$targetStockDays", "$processingDays"] },
                "$fullCoverageDays",
              ],
            },
          ],
        },
        flexReplenishmentDays: {
          $max: [
            0,
            {
              $subtract: [
                { $add: ["$targetStockDays", "$processingDays"] },
                "$flexCoverageDays",
              ],
            },
          ],
        },
        fullsuggestedUnits: {
          $ceil: {
            $multiply: [
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $add: ["$targetStockDays", "$processingDays"] },
                      "$fullCoverageDays",
                    ],
                  },
                ],
              },
              { $ifNull: ["$fullDailySales", 0] },
            ],
          },
        },
        flexsuggestedUnits: {
          $ceil: {
            $multiply: [
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $add: ["$targetStockDays", "$processingDays"] },
                      "$flexCoverageDays",
                    ],
                  },
                ],
              },
              { $ifNull: ["$flexDailySales", 0] },
            ],
          },
        },
      },
    };
  },
};
