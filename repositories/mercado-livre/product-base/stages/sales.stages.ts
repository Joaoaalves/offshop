import { PipelineStage } from "mongoose";

export const SalesStages = {
  lookup(startMonth: Date, nextMonth: Date): PipelineStage.Lookup {
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
                  { $gte: ["$date", startMonth] },
                  { $lt: ["$date", nextMonth] },
                ],
              },
            },
          },
          {
            $group: {
              _id: { $dateTrunc: { date: "$date", unit: "month" } },
              // total
              totalItems: { $sum: "$total.items" },
              totalRevenue: { $sum: "$total.revenue" },
              totalOrders: { $sum: "$total.orders" },
              // fulfillment
              fulfillmentItems: { $sum: "$fulfillment.items" },
              fulfillmentRevenue: { $sum: "$fulfillment.revenue" },
              fulfillmentOrders: { $sum: "$fulfillment.orders" },
              // flex
              flexItems: { $sum: "$flex.items" },
              flexRevenue: { $sum: "$flex.revenue" },
              flexOrders: { $sum: "$flex.orders" },
              // dropOff
              dropOffItems: { $sum: "$dropOff.items" },
              dropOffRevenue: { $sum: "$dropOff.revenue" },
              dropOffOrders: { $sum: "$dropOff.orders" },
            },
          },
        ],
        as: "salesByMonth",
      },
    };
  },
};
