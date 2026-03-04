import { PipelineStage } from "mongoose";

export const ViewsStages = {
  lookup(startMonth: Date, nextMonth: Date): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "mlviews",
        let: { pid: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$productId", "$$pid"] },
                  { $gte: ["$date", startMonth] },
                  { $lt: ["$date", nextMonth] },
                ],
              },
            },
          },
          {
            $group: {
              _id: { $dateTrunc: { date: "$date", unit: "month" } },
              views: { $sum: "$views" },
            },
          },
        ],
        as: "viewsByMonth",
      },
    };
  },
};
