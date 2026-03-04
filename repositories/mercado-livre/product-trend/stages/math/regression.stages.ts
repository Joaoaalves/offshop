import { PipelineStage } from "mongoose";

export const RegressionStages = {
  computeSum(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_n: { $size: "$_reg_series" },
        _full_reg_n: { $size: "$_full_reg_series" },
        _flex_reg_n: { $size: "$_flex_reg_series" },
        _reg_sums: {
          $reduce: {
            input: "$_reg_series",
            initialValue: { sx: 0, sy: 0, sxy: 0, sx2: 0 },
            in: {
              sx: { $add: ["$$value.sx", "$$this.x"] },
              sy: { $add: ["$$value.sy", "$$this.y"] },
              sxy: {
                $add: ["$$value.sxy", { $multiply: ["$$this.x", "$$this.y"] }],
              },
              sx2: {
                $add: ["$$value.sx2", { $multiply: ["$$this.x", "$$this.x"] }],
              },
            },
          },
        },
        _full_reg_sums: {
          $reduce: {
            input: "$_full_reg_series",
            initialValue: { sx: 0, sy: 0, sxy: 0, sx2: 0 },
            in: {
              sx: { $add: ["$$value.sx", "$$this.x"] },
              sy: { $add: ["$$value.sy", "$$this.y"] },
              sxy: {
                $add: ["$$value.sxy", { $multiply: ["$$this.x", "$$this.y"] }],
              },
              sx2: {
                $add: ["$$value.sx2", { $multiply: ["$$this.x", "$$this.x"] }],
              },
            },
          },
        },
        _flex_reg_sums: {
          $reduce: {
            input: "$_flex_reg_series",
            initialValue: { sx: 0, sy: 0, sxy: 0, sx2: 0 },
            in: {
              sx: { $add: ["$$value.sx", "$$this.x"] },
              sy: { $add: ["$$value.sy", "$$this.y"] },
              sxy: {
                $add: ["$$value.sxy", { $multiply: ["$$this.x", "$$this.y"] }],
              },
              sx2: {
                $add: ["$$value.sx2", { $multiply: ["$$this.x", "$$this.x"] }],
              },
            },
          },
        },
      },
    };
  },
  computeDenominator(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_denom: {
          $subtract: [
            { $multiply: ["$_reg_n", "$_reg_sums.sx2"] },
            { $multiply: ["$_reg_sums.sx", "$_reg_sums.sx"] },
          ],
        },
        _full_reg_denom: {
          $subtract: [
            { $multiply: ["$_full_reg_n", "$_full_reg_sums.sx2"] },
            { $multiply: ["$_full_reg_sums.sx", "$_full_reg_sums.sx"] },
          ],
        },
        _flex_reg_denom: {
          $subtract: [
            { $multiply: ["$_flex_reg_n", "$_flex_reg_sums.sx2"] },
            { $multiply: ["$_flex_reg_sums.sx", "$_flex_reg_sums.sx"] },
          ],
        },
        _reg_avg_y: {
          $cond: {
            if: { $gt: ["$_reg_n", 0] },
            then: { $divide: ["$_reg_sums.sy", "$_reg_n"] },
            else: 0,
          },
        },
        _full_reg_avg_y: {
          $cond: {
            if: { $gt: ["$_full_reg_n", 0] },
            then: { $divide: ["$_full_reg_sums.sy", "$_full_reg_n"] },
            else: 0,
          },
        },
        _flex_reg_avg_y: {
          $cond: {
            if: { $gt: ["$_flex_reg_n", 0] },
            then: { $divide: ["$_flex_reg_sums.sy", "$_flex_reg_n"] },
            else: 0,
          },
        },
      },
    };
  },
  computeSlope(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_slope: {
          $cond: {
            if: { $gt: ["$_reg_denom", 0] },
            then: {
              $divide: [
                {
                  $subtract: [
                    { $multiply: ["$_reg_n", "$_reg_sums.sxy"] },
                    { $multiply: ["$_reg_sums.sx", "$_reg_sums.sy"] },
                  ],
                },
                "$_reg_denom",
              ],
            },
            else: 0,
          },
        },
        _full_reg_slope: {
          $cond: {
            if: { $gt: ["$_full_reg_denom", 0] },
            then: {
              $divide: [
                {
                  $subtract: [
                    { $multiply: ["$_full_reg_n", "$_full_reg_sums.sxy"] },
                    {
                      $multiply: ["$_full_reg_sums.sx", "$_full_reg_sums.sy"],
                    },
                  ],
                },
                "$_full_reg_denom",
              ],
            },
            else: 0,
          },
        },
        _flex_reg_slope: {
          $cond: {
            if: { $gt: ["$_flex_reg_denom", 0] },
            then: {
              $divide: [
                {
                  $subtract: [
                    { $multiply: ["$_flex_reg_n", "$_flex_reg_sums.sxy"] },
                    {
                      $multiply: ["$_flex_reg_sums.sx", "$_flex_reg_sums.sy"],
                    },
                  ],
                },
                "$_flex_reg_denom",
              ],
            },
            else: 0,
          },
        },
      },
    };
  },
  computeIntercept(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_intercept: {
          $cond: {
            if: { $gt: ["$_reg_n", 0] },
            then: {
              $divide: [
                {
                  $subtract: [
                    "$_reg_sums.sy",
                    { $multiply: ["$_reg_slope", "$_reg_sums.sx"] },
                  ],
                },
                "$_reg_n",
              ],
            },
            else: 0,
          },
        },
        _full_reg_intercept: {
          $cond: {
            if: { $gt: ["$_full_reg_n", 0] },
            then: {
              $divide: [
                {
                  $subtract: [
                    "$_full_reg_sums.sy",
                    { $multiply: ["$_full_reg_slope", "$_full_reg_sums.sx"] },
                  ],
                },
                "$_full_reg_n",
              ],
            },
            else: 0,
          },
        },
        _flex_reg_intercept: {
          $cond: {
            if: { $gt: ["$_flex_reg_n", 0] },
            then: {
              $divide: [
                {
                  $subtract: [
                    "$_flex_reg_sums.sy",
                    { $multiply: ["$_flex_reg_slope", "$_flex_reg_sums.sx"] },
                  ],
                },
                "$_flex_reg_n",
              ],
            },
            else: 0,
          },
        },
        _reg_slope_pct: {
          $cond: {
            if: { $gt: ["$_reg_avg_y", 0] },
            then: {
              $multiply: [{ $divide: ["$_reg_slope", "$_reg_avg_y"] }, 100],
            },
            else: 0,
          },
        },
        _full_reg_slope_pct: {
          $cond: {
            if: { $gt: ["$_full_reg_avg_y", 0] },
            then: {
              $multiply: [
                { $divide: ["$_full_reg_slope", "$_full_reg_avg_y"] },
                100,
              ],
            },
            else: 0,
          },
        },
        _flex_reg_slope_pct: {
          $cond: {
            if: { $gt: ["$_flex_reg_avg_y", 0] },
            then: {
              $multiply: [
                { $divide: ["$_flex_reg_slope", "$_flex_reg_avg_y"] },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    };
  },
  computeSlopePct(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_residuals: {
          $map: {
            input: "$_reg_series",
            as: "p",
            in: {
              $subtract: [
                "$$p.y",
                {
                  $add: [
                    { $multiply: ["$_reg_slope", "$$p.x"] },
                    "$_reg_intercept",
                  ],
                },
              ],
            },
          },
        },
        _full_reg_residuals: {
          $map: {
            input: "$_full_reg_series",
            as: "p",
            in: {
              $subtract: [
                "$$p.y",
                {
                  $add: [
                    { $multiply: ["$_full_reg_slope", "$$p.x"] },
                    "$_full_reg_intercept",
                  ],
                },
              ],
            },
          },
        },
        _flex_reg_residuals: {
          $map: {
            input: "$_flex_reg_series",
            as: "p",
            in: {
              $subtract: [
                "$$p.y",
                {
                  $add: [
                    { $multiply: ["$_flex_reg_slope", "$$p.x"] },
                    "$_flex_reg_intercept",
                  ],
                },
              ],
            },
          },
        },
      },
    };
  },
};
