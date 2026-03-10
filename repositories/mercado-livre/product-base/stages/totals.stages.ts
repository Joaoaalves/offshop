import { PipelineStage } from "mongoose";

export const TotalsStages = {
  lookup(): PipelineStage.Lookup[] {
    const bucketLookup = (amount: number, as: string): PipelineStage.Lookup => ({
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
                          amount,
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
        as,
      },
    });

    return [bucketLookup(45, "_daily45"), bucketLookup(30, "_daily30")];
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
        dailyAvg30: {
          $cond: {
            if: { $gt: [{ $size: "$_daily30" }, 0] },
            then: {
              revenue: { $divide: [{ $sum: "$_daily30.revenue" }, 30] },
              units: { $divide: [{ $sum: "$_daily30.units" }, 30] },
              activeDays: { $size: "$_daily30" },
            },
            else: { revenue: 0, units: 0, activeDays: 0 },
          },
        },
      },
    };
  },
};
