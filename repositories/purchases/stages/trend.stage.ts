import { PipelineStage } from "mongoose";

/** 15d avg must exceed 30d avg by this factor to be considered "rising" */
const RISING_THRESHOLD = 1.1;

/** 15d avg must be below 30d avg by this factor to be considered "falling" */
const FALLING_THRESHOLD = 0.9;

/**
 * Classifies trend by comparing the 15-day daily average against the 30-day daily average.
 *
 *  rising  — 15d avg > 30d avg × 1.10
 *  falling — 15d avg < 30d avg × 0.90
 *  stable  — otherwise (includes products with no sales)
 */
export const TrendStage = {
  compute(): PipelineStage.AddFields {
    return {
      $addFields: {
        trend: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $gt: ["$sales30d.dailyAvg", 0] },
                    {
                      $gt: [
                        "$sales15d.dailyAvg",
                        {
                          $multiply: [
                            "$sales30d.dailyAvg",
                            RISING_THRESHOLD,
                          ],
                        },
                      ],
                    },
                  ],
                },
                then: "rising",
              },
              {
                case: {
                  $and: [
                    { $gt: ["$sales30d.dailyAvg", 0] },
                    {
                      $lt: [
                        "$sales15d.dailyAvg",
                        {
                          $multiply: [
                            "$sales30d.dailyAvg",
                            FALLING_THRESHOLD,
                          ],
                        },
                      ],
                    },
                  ],
                },
                then: "falling",
              },
            ],
            default: "stable",
          },
        },
      },
    };
  },
};
