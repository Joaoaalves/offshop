import { PipelineStage } from "mongoose";

export const ConversionStages = {
  addValidSeries(): PipelineStage.AddFields {
    return {
      $addFields: {
        _conv_valid_series: {
          $map: {
            input: {
              $filter: {
                input: "$months",
                as: "m",
                cond: { $gt: ["$$m.views", 0] },
              },
            },
            as: "m",
            in: "$$m.conversionRate",
          },
        },
      },
    };
  },
  calcConversions(): PipelineStage.AddFields {
    return {
      $addFields: {
        _conv_valid_count: { $size: "$_conv_valid_series" },
        _conv_recent: { $arrayElemAt: ["$_conv_valid_series", -1] },
        _conv_early_avg: {
          $cond: {
            if: { $lte: [{ $size: "$_conv_valid_series" }, 1] },
            then: 0,
            else: {
              $avg: {
                $slice: [
                  "$_conv_valid_series",
                  0,
                  {
                    $max: [
                      { $subtract: [{ $size: "$_conv_valid_series" }, 1] },
                      1,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    };
  },
  checkIfDropped(): PipelineStage.AddFields {
    return {
      $addFields: {
        conversionDropped: {
          $cond: {
            if: {
              $and: [
                { $gte: ["$_conv_valid_count", 2] },
                { $gt: ["$_conv_early_avg", 0] },
              ],
            },
            then: {
              $lt: ["$_conv_recent", { $multiply: ["$_conv_early_avg", 0.7] }],
            },
            else: false,
          },
        },
        conversionDropPct: {
          $cond: {
            if: {
              $and: [
                { $gte: ["$_conv_valid_count", 2] },
                { $gt: ["$_conv_early_avg", 0] },
              ],
            },
            then: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ["$_conv_early_avg", "$_conv_recent"] },
                    "$_conv_early_avg",
                  ],
                },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    };
  },
};
