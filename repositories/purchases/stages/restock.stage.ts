import { PipelineStage } from "mongoose";

/**
 * Computes restock metrics based on current stock and sales velocity.
 *
 * Total stock considered = storage + incoming + fulfillment
 *
 * targetDays     = minStockDays + supplierLeadTimeDays + supplierSafetyDays
 * daysOfCoverage = totalStock / dailyAvg  (999 if dailyAvg = 0 but stock > 0)
 * suggestedUnits = ceil((targetDays - daysOfCoverage) × dailyAvg)
 *                  rounded UP to the nearest multiple of unitsPerBox
 *                  (0 if coverage already meets targetDays)
 */
export const RestockStage = {
  compute(): PipelineStage.AddFields {
    return {
      $addFields: {
        restock: {
          $let: {
            vars: {
              dailyAvg: "$sales30d.dailyAvg",
              totalStock: {
                $add: [
                  { $ifNull: ["$stock.storage", 0] },
                  { $ifNull: ["$stock.incoming", 0] },
                  { $ifNull: ["$stock.fulfillment", 0] },
                ],
              },
              minDays: {
                $add: [
                  { $ifNull: ["$minStockDays", 30] },
                  { $ifNull: ["$supplierLeadTimeDays", 0] },
                  { $ifNull: ["$supplierSafetyDays", 0] },
                ],
              },
              upb: { $max: [{ $ifNull: ["$unitsPerBox", 1] }, 1] },
            },
            in: {
              $let: {
                vars: {
                  daysOfCoverage: {
                    $cond: {
                      if: { $gt: ["$$dailyAvg", 0] },
                      then: { $divide: ["$$totalStock", "$$dailyAvg"] },
                      else: {
                        // No sales: infinite coverage if stock exists, else 0
                        $cond: [{ $gt: ["$$totalStock", 0] }, 999, 0],
                      },
                    },
                  },
                },
                in: {
                  daysOfCoverage: "$$daysOfCoverage",
                  suggestedUnits: {
                    $cond: {
                      if: {
                        $and: [
                          { $gt: ["$$dailyAvg", 0] },
                          { $lt: ["$$daysOfCoverage", "$$minDays"] },
                        ],
                      },
                      then: {
                        // ceil((gap_days × dailyAvg) / upb) × upb
                        $multiply: [
                          "$$upb",
                          {
                            $ceil: {
                              $divide: [
                                {
                                  $multiply: [
                                    {
                                      $subtract: [
                                        "$$minDays",
                                        "$$daysOfCoverage",
                                      ],
                                    },
                                    "$$dailyAvg",
                                  ],
                                },
                                "$$upb",
                              ],
                            },
                          },
                        ],
                      },
                      else: 0,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  },
};
