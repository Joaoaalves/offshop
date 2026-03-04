import { PipelineStage } from "mongoose";

export const ResidualStages = {
  computeResiduals(): PipelineStage.AddFields {
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
  computeStdResidual(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_ss_res: {
          $reduce: {
            input: "$_reg_residuals",
            initialValue: 0,
            in: { $add: ["$$value", { $multiply: ["$$this", "$$this"] }] },
          },
        },
        _full_reg_ss_res: {
          $reduce: {
            input: "$_full_reg_residuals",
            initialValue: 0,
            in: { $add: ["$$value", { $multiply: ["$$this", "$$this"] }] },
          },
        },
        _flex_reg_ss_res: {
          $reduce: {
            input: "$_flex_reg_residuals",
            initialValue: 0,
            in: { $add: ["$$value", { $multiply: ["$$this", "$$this"] }] },
          },
        },
        _reg_ss_tot: {
          $reduce: {
            input: "$_reg_series",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $multiply: [
                    { $subtract: ["$$this.y", "$_reg_avg_y"] },
                    { $subtract: ["$$this.y", "$_reg_avg_y"] },
                  ],
                },
              ],
            },
          },
        },
        _full_reg_ss_tot: {
          $reduce: {
            input: "$_full_reg_series",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $multiply: [
                    { $subtract: ["$$this.y", "$_full_reg_avg_y"] },
                    { $subtract: ["$$this.y", "$_full_reg_avg_y"] },
                  ],
                },
              ],
            },
          },
        },
        _flex_reg_ss_tot: {
          $reduce: {
            input: "$_flex_reg_series",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $multiply: [
                    { $subtract: ["$$this.y", "$_flex_reg_avg_y"] },
                    { $subtract: ["$$this.y", "$_flex_reg_avg_y"] },
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
