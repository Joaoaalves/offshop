import { PipelineStage } from "mongoose";

export const SalesStages = {
  lookupLastDays(windowDays: number): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "salesbuckets",
        let: { mlbIds: "$mlbIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$product", "$$mlbIds"] },
                  {
                    $gte: [
                      "$date",
                      {
                        $dateSubtract: {
                          startDate: "$$NOW",
                          unit: "day",
                          amount: windowDays,
                        },
                      },
                    ],
                  },
                  { $lte: ["$date", "$$NOW"] },
                ],
              },
            },
          },

          // Multiplier para combos numéricos (2U-, 3U-, etc.)
          {
            $addFields: {
              _isNumericCombo: {
                $regexMatch: { input: "$sku", regex: /^[0-9]+U-/ },
              },
            },
          },
          {
            $addFields: {
              comboMultiplier: {
                $cond: [
                  "$_isNumericCombo",
                  {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$sku", "U-"] }, 0],
                    },
                  },
                  1,
                ],
              },
            },
          },

          // Agrupa por mês — campos vindos da nova estrutura do SalesBucket
          {
            $group: {
              _id: { $dateTrunc: { date: "$date", unit: "month" } },

              // total (com multiplicador de combo aplicado apenas em items)
              totalItems: {
                $sum: { $multiply: ["$total.items", "$comboMultiplier"] },
              },
              totalRevenue: { $sum: "$total.revenue" },
              totalOrders: { $sum: "$total.orders" },

              // por modalidade
              fulfillmentItems: {
                $sum: {
                  $multiply: ["$fulfillment.items", "$comboMultiplier"],
                },
              },
              fulfillmentRevenue: { $sum: "$fulfillment.revenue" },
              fulfillmentOrders: { $sum: "$fulfillment.orders" },

              flexItems: {
                $sum: { $multiply: ["$flex.items", "$comboMultiplier"] },
              },
              flexRevenue: { $sum: "$flex.revenue" },
              flexOrders: { $sum: "$flex.orders" },

              dropOffItems: {
                $sum: { $multiply: ["$dropOff.items", "$comboMultiplier"] },
              },
              dropOffRevenue: { $sum: "$dropOff.revenue" },
              dropOffOrders: { $sum: "$dropOff.orders" },
            },
          },

          { $sort: { _id: -1 } },
        ],
        as: "months",
      },
    };
  },

  addLastDays(): PipelineStage.AddFields {
    return {
      $addFields: {
        totalUnitsLast45: { $sum: "$months.totalItems" },
        totalFulfillmentOrders45: { $sum: "$months.fulfillmentOrders" },
        totalFlexOrders45: { $sum: "$months.flexOrders" },
        totalDropOffOrders45: { $sum: "$months.dropOffOrders" },
      },
    };
  },

  totals(windowDays: number): PipelineStage.AddFields {
    return {
      $addFields: {
        avgDailySales: {
          $cond: [
            { $gt: ["$totalUnitsLast45", 0] },
            { $divide: ["$totalUnitsLast45", windowDays] },
            0,
          ],
        },
        _totalOrders: {
          $add: [
            { $ifNull: ["$totalFulfillmentOrders45", 0] },
            { $ifNull: ["$totalFlexOrders45", 0] },
            { $ifNull: ["$totalDropOffOrders45", 0] },
          ],
        },
      },
    };
  },
};
