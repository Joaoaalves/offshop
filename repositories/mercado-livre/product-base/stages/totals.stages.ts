import { PipelineStage } from "mongoose";

export const TotalsStages = {
  lookup(): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "salesbuckets",
        let: { pid: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$product", "$$pid"] },
                  {
                    $gte: [
                      "$date",
                      {
                        $dateSubtract: {
                          startDate: "$$NOW",
                          unit: "day",
                          amount: 45,
                        },
                      },
                    ],
                  },
                  { $lt: ["$date", "$$NOW"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: { $dateTrunc: { date: "$date", unit: "day" } },
              revenue: { $sum: "$total.revenue" },
              units: { $sum: "$total.items" },
            },
          },
        ],
        as: "_daily45",
      },
    };
  },

  compute(): PipelineStage.AddFields {
    return {
      $addFields: {
        totals: {
          units: { $sum: "$months.total.items" },
          revenue: { $sum: "$months.total.revenue" },
          orders: { $sum: "$months.total.orders" },
          views: { $sum: "$months.views" },
        },
        isNew: {
          $gte: [
            "$dateCreated",
            {
              $dateSubtract: { startDate: "$$NOW", unit: "month", amount: 2 },
            },
          ],
        },
        dailyAvg45: {
          $cond: {
            if: { $gt: [{ $size: "$_daily45" }, 0] },
            then: {
              revenue: { $divide: [{ $sum: "$_daily45.revenue" }, 45] },
              units: { $divide: [{ $sum: "$_daily45.units" }, 45] },
              activeDays: { $size: "$_daily45" },
            },
            else: { revenue: 0, units: 0, activeDays: 0 },
          },
        },
      },
    };
  },
};
