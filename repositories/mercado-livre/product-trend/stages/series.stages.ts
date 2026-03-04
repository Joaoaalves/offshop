import { PipelineStage } from "mongoose";

export const SeriesStages = {
  addSeries(): PipelineStage.AddFields {
    return {
      $addFields: {
        revenueSeries: "$months.total.revenue",
        fullRevenueSeries: "$months.fulfillment.revenue",
        flexRevenueSeries: "$months.flex.revenue",
        conversionSeries: "$months.conversionRate",
      },
    };
  },

  addRegSeries(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_series: {
          $let: {
            vars: {
              complete: {
                $slice: [
                  "$revenueSeries",
                  0,
                  {
                    $max: [{ $subtract: [{ $size: "$revenueSeries" }, 1] }, 1],
                  },
                ],
              },
            },
            in: {
              $map: {
                input: { $range: [0, { $size: "$$complete" }] },
                as: "i",
                in: { x: "$$i", y: { $arrayElemAt: ["$$complete", "$$i"] } },
              },
            },
          },
        },
        _full_reg_series: {
          $let: {
            vars: {
              complete: {
                $slice: [
                  "$fullRevenueSeries",
                  0,
                  {
                    $max: [
                      { $subtract: [{ $size: "$fullRevenueSeries" }, 1] },
                      1,
                    ],
                  },
                ],
              },
            },
            in: {
              $map: {
                input: { $range: [0, { $size: "$$complete" }] },
                as: "i",
                in: { x: "$$i", y: { $arrayElemAt: ["$$complete", "$$i"] } },
              },
            },
          },
        },
        _flex_reg_series: {
          $let: {
            vars: {
              complete: {
                $slice: [
                  "$flexRevenueSeries",
                  0,
                  {
                    $max: [
                      { $subtract: [{ $size: "$flexRevenueSeries" }, 1] },
                      1,
                    ],
                  },
                ],
              },
            },
            in: {
              $map: {
                input: { $range: [0, { $size: "$$complete" }] },
                as: "i",
                in: { x: "$$i", y: { $arrayElemAt: ["$$complete", "$$i"] } },
              },
            },
          },
        },
      },
    };
  },
};
