import { PipelineStage } from "mongoose";

export const MetricsStages = {
  addMetrics(): PipelineStage.AddFields {
    return {
      $addFields: {
        _rev_m0: { $arrayElemAt: ["$revenueSeries", -2] },
        _rev_m1: { $arrayElemAt: ["$revenueSeries", -3] },
        _full_rev_m0: { $arrayElemAt: ["$fullRevenueSeries", -2] },
        _full_rev_m1: { $arrayElemAt: ["$fullRevenueSeries", -3] },
        _flex_rev_m0: { $arrayElemAt: ["$flexRevenueSeries", -2] },
        _flex_rev_m1: { $arrayElemAt: ["$flexRevenueSeries", -3] },
        _nonzero_count: {
          $size: {
            $filter: {
              input: "$revenueSeries",
              as: "r",
              cond: { $gt: ["$$r", 0] },
            },
          },
        },
        _full_nonzero_count: {
          $size: {
            $filter: {
              input: "$fullRevenueSeries",
              as: "r",
              cond: { $gt: ["$$r", 0] },
            },
          },
        },
        _flex_nonzero_count: {
          $size: {
            $filter: {
              input: "$flexRevenueSeries",
              as: "r",
              cond: { $gt: ["$$r", 0] },
            },
          },
        },
        _had_sales_before: {
          $cond: {
            if: { $lte: [{ $size: "$revenueSeries" }, 2] },
            then: false,
            else: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: {
                        $slice: [
                          "$revenueSeries",
                          0,
                          {
                            $max: [
                              { $subtract: [{ $size: "$revenueSeries" }, 2] },
                              1,
                            ],
                          },
                        ],
                      },
                      as: "r",
                      cond: { $gt: ["$$r", 0] },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        _full_had_sales_before: {
          $cond: {
            if: { $lte: [{ $size: "$fullRevenueSeries" }, 2] },
            then: false,
            else: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: {
                        $slice: [
                          "$fullRevenueSeries",
                          0,
                          {
                            $max: [
                              {
                                $subtract: [{ $size: "$fullRevenueSeries" }, 2],
                              },
                              1,
                            ],
                          },
                        ],
                      },
                      as: "r",
                      cond: { $gt: ["$$r", 0] },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        _flex_had_sales_before: {
          $cond: {
            if: { $lte: [{ $size: "$flexRevenueSeries" }, 2] },
            then: false,
            else: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: {
                        $slice: [
                          "$flexRevenueSeries",
                          0,
                          {
                            $max: [
                              {
                                $subtract: [{ $size: "$flexRevenueSeries" }, 2],
                              },
                              1,
                            ],
                          },
                        ],
                      },
                      as: "r",
                      cond: { $gt: ["$$r", 0] },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    };
  },
};
