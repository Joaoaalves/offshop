import { Momentum } from "@/types/enums";
import { PipelineStage } from "mongoose";

export const EarlySignalStages = {
  getMonthDays(): PipelineStage.AddFields {
    return {
      $addFields: {
        _day_of_month: { $dayOfMonth: "$$NOW" },
        _days_in_month: {
          $divide: [
            {
              $subtract: [
                {
                  $dateFromParts: {
                    year: {
                      $year: {
                        $dateAdd: {
                          startDate: "$$NOW",
                          unit: "month",
                          amount: 1,
                        },
                      },
                    },
                    month: {
                      $month: {
                        $dateAdd: {
                          startDate: "$$NOW",
                          unit: "month",
                          amount: 1,
                        },
                      },
                    },
                    day: 1,
                  },
                },
                {
                  $dateFromParts: {
                    year: { $year: "$$NOW" },
                    month: { $month: "$$NOW" },
                    day: 1,
                  },
                },
              ],
            },
            86400000,
          ],
        },
      },
    };
  },
  addProjections(): PipelineStage.AddFields {
    return {
      $addFields: {
        _month_completion_pct: {
          $divide: ["$_day_of_month", "$_days_in_month"],
        },
        _projected_revenue: {
          $cond: {
            if: { $gt: ["$_day_of_month", 0] },
            then: {
              $multiply: [
                { $arrayElemAt: ["$revenueSeries", -1] },
                { $divide: ["$_days_in_month", "$_day_of_month"] },
              ],
            },
            else: 0,
          },
        },
        _full_projected_revenue: {
          $cond: {
            if: { $gt: ["$_day_of_month", 0] },
            then: {
              $multiply: [
                { $arrayElemAt: ["$fullRevenueSeries", -1] },
                { $divide: ["$_days_in_month", "$_day_of_month"] },
              ],
            },
            else: 0,
          },
        },
        _flex_projected_revenue: {
          $cond: {
            if: { $gt: ["$_day_of_month", 0] },
            then: {
              $multiply: [
                { $arrayElemAt: ["$flexRevenueSeries", -1] },
                { $divide: ["$_days_in_month", "$_day_of_month"] },
              ],
            },
            else: 0,
          },
        },
        _last_complete_revenue: { $arrayElemAt: ["$revenueSeries", -2] },
        _full_last_complete_revenue: {
          $arrayElemAt: ["$fullRevenueSeries", -2],
        },
        _flex_last_complete_revenue: {
          $arrayElemAt: ["$flexRevenueSeries", -2],
        },
      },
    };
  },
  addEarlySignal(): PipelineStage.AddFields {
    return {
      $addFields: {
        earlySignal: {
          $cond: {
            if: {
              $and: [
                { $gte: ["$_month_completion_pct", 0.2] },
                { $gt: ["$_last_complete_revenue", 0] },
              ],
            },
            then: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: [
                        "$_projected_revenue",
                        { $multiply: ["$_last_complete_revenue", 1.1] },
                      ],
                    },
                    then: Momentum.GROWING,
                  },
                  {
                    case: {
                      $lt: [
                        "$_projected_revenue",
                        { $multiply: ["$_last_complete_revenue", 0.9] },
                      ],
                    },
                    then: Momentum.FALLING,
                  },
                ],
                default: Momentum.STABLE,
              },
            },
            else: null,
          },
        },
        _full_earlySignal: {
          $cond: {
            if: {
              $and: [
                { $gte: ["$_month_completion_pct", 0.2] },
                { $gt: ["$_full_last_complete_revenue", 0] },
              ],
            },
            then: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: [
                        "$_full_projected_revenue",
                        { $multiply: ["$_full_last_complete_revenue", 1.1] },
                      ],
                    },
                    then: Momentum.GROWING,
                  },
                  {
                    case: {
                      $lt: [
                        "$_full_projected_revenue",
                        { $multiply: ["$_full_last_complete_revenue", 0.9] },
                      ],
                    },
                    then: Momentum.FALLING,
                  },
                ],
                default: Momentum.STABLE,
              },
            },
            else: null,
          },
        },
        _flex_earlySignal: {
          $cond: {
            if: {
              $and: [
                { $gte: ["$_month_completion_pct", 0.2] },
                { $gt: ["$_flex_last_complete_revenue", 0] },
              ],
            },
            then: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: [
                        "$_flex_projected_revenue",
                        { $multiply: ["$_flex_last_complete_revenue", 1.1] },
                      ],
                    },
                    then: Momentum.GROWING,
                  },
                  {
                    case: {
                      $lt: [
                        "$_flex_projected_revenue",
                        { $multiply: ["$_flex_last_complete_revenue", 0.9] },
                      ],
                    },
                    then: Momentum.FALLING,
                  },
                ],
                default: Momentum.STABLE,
              },
            },
            else: null,
          },
        },
      },
    };
  },
};
