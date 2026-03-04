import { PipelineStage } from "mongoose";

export const R2Stages = {
  compute(): PipelineStage.AddFields {
    return {
      $addFields: {
        _reg_r2: {
          $cond: {
            if: { $gt: ["$_reg_ss_tot", 0] },
            then: {
              $subtract: [1, { $divide: ["$_reg_ss_res", "$_reg_ss_tot"] }],
            },
            else: 0,
          },
        },
        _full_reg_r2: {
          $cond: {
            if: { $gt: ["$_full_reg_ss_tot", 0] },
            then: {
              $subtract: [
                1,
                { $divide: ["$_full_reg_ss_res", "$_full_reg_ss_tot"] },
              ],
            },
            else: 0,
          },
        },
        _flex_reg_r2: {
          $cond: {
            if: { $gt: ["$_flex_reg_ss_tot", 0] },
            then: {
              $subtract: [
                1,
                { $divide: ["$_flex_reg_ss_res", "$_flex_reg_ss_tot"] },
              ],
            },
            else: 0,
          },
        },
        _reg_std_residual: {
          $cond: {
            if: { $gt: ["$_reg_n", 1] },
            then: {
              $sqrt: {
                $divide: [
                  {
                    $reduce: {
                      input: "$_reg_residuals",
                      initialValue: 0,
                      in: {
                        $add: ["$$value", { $multiply: ["$$this", "$$this"] }],
                      },
                    },
                  },
                  { $subtract: ["$_reg_n", 1] },
                ],
              },
            },
            else: 0,
          },
        },
        _full_reg_std_residual: {
          $cond: {
            if: { $gt: ["$_full_reg_n", 1] },
            then: {
              $sqrt: {
                $divide: [
                  {
                    $reduce: {
                      input: "$_full_reg_residuals",
                      initialValue: 0,
                      in: {
                        $add: ["$$value", { $multiply: ["$$this", "$$this"] }],
                      },
                    },
                  },
                  { $subtract: ["$_full_reg_n", 1] },
                ],
              },
            },
            else: 0,
          },
        },
        _flex_reg_std_residual: {
          $cond: {
            if: { $gt: ["$_flex_reg_n", 1] },
            then: {
              $sqrt: {
                $divide: [
                  {
                    $reduce: {
                      input: "$_flex_reg_residuals",
                      initialValue: 0,
                      in: {
                        $add: ["$$value", { $multiply: ["$$this", "$$this"] }],
                      },
                    },
                  },
                  { $subtract: ["$_flex_reg_n", 1] },
                ],
              },
            },
            else: 0,
          },
        },
      },
    };
  },
};
