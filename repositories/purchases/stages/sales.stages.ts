import { PipelineStage } from "mongoose";

/**
 * Extracts the numeric multiplier from a salesbuckets sku.
 *
 * Examples:
 *   "5U-SKU123"    → 5
 *   "KIT-SKU123"   → 1
 *   "SKU123"       → 1
 */
const MULTIPLIER_EXPR = {
  $cond: [
    { $regexMatch: { input: "$sku", regex: /^([0-9]+)U-/ } },
    { $toInt: { $arrayElemAt: [{ $split: ["$sku", "U-"] }, 0] } },
    1,
  ],
};

/**
 * Lookup sales from salesbuckets for this product's baseSku.
 *
 * Matches:
 *  - Direct simples sales:  sku === baseSku
 *  - Kit sales:             sku matches ^(\d+U-|KIT-)baseSku$ (multiplier applied)
 *
 * NOTE: assumes salesbuckets.sku stores the original ML product sku (with any
 * numeric/KIT prefix), which is the format produced by the ML ingest pipeline.
 */
export const SalesStages = {
  lookupDirectAndKit(days: number, alias: string): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "salesbuckets",
        let: { baseSku: "$baseSku" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    // Match: baseSku  OR  {N}U-baseSku  OR  KIT-baseSku
                    $regexMatch: {
                      input: "$sku",
                      regex: {
                        $concat: ["^(\\d+U-|KIT-)?", "$$baseSku", { $literal: "$" }],
                      },
                    },
                  },
                  {
                    $gte: [
                      "$date",
                      {
                        $dateSubtract: {
                          startDate: "$$NOW",
                          unit: "day",
                          amount: days,
                        },
                      },
                    ],
                  },
                  { $lte: ["$date", "$$NOW"] },
                ],
              },
            },
          },
          { $addFields: { _mult: MULTIPLIER_EXPR } },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$total.items", "$_mult"] } },
            },
          },
        ],
        as: alias,
      },
    };
  },

  /**
   * Lookup InternalProduct combos that contain this simples product as a
   * component, then sum how many units of this product were sold through them.
   *
   * For each combo found:
   *   contribution = combo_items_sold × quantity_of_this_product_in_combo
   */
  lookupComboContributions(
    days: number,
    alias: string,
  ): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "internalproducts",
        let: { pid: "$_id" },
        pipeline: [
          // 1 — Find combos that contain this product
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$productType", "combo"] },
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: { $ifNull: ["$components", []] },
                            cond: { $eq: ["$$this.product", "$$pid"] },
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },

          // 2 — Extract quantity of our product in this combo
          {
            $addFields: {
              _qty: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: { $ifNull: ["$components", []] },
                          cond: { $eq: ["$$this.product", "$$pid"] },
                        },
                      },
                      in: "$$this.quantity",
                    },
                  },
                  0,
                ],
              },
            },
          },

          // 3 — Lookup this combo's sales (matches COMBO-baseSku or baseSku)
          {
            $lookup: {
              from: "salesbuckets",
              let: { comboSku: "$baseSku", qty: "$_qty" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $regexMatch: {
                            input: "$sku",
                            regex: {
                              $concat: ["^(COMBO-)?", "$$comboSku", { $literal: "$" }],
                            },
                          },
                        },
                        {
                          $gte: [
                            "$date",
                            {
                              $dateSubtract: {
                                startDate: "$$NOW",
                                unit: "day",
                                amount: days,
                              },
                            },
                          ],
                        },
                        { $lte: ["$date", "$$NOW"] },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    comboTotal: { $sum: "$total.items" },
                  },
                },
                // Apply qty multiplier: units_of_this_product = combo_sales × qty
                {
                  $addFields: {
                    contribution: { $multiply: ["$comboTotal", "$$qty"] },
                  },
                },
              ],
              as: "_comboSales",
            },
          },

          // 4 — Flatten contribution for easy summing in outer stage
          {
            $addFields: {
              _contribution: {
                $ifNull: [
                  { $arrayElemAt: ["$_comboSales.contribution", 0] },
                  0,
                ],
              },
            },
          },
        ],
        as: alias,
      },
    };
  },

  /**
   * Combine direct+kit sales and combo contributions into sales{N}d metrics.
   */
  computeMetrics(days: number): PipelineStage.AddFields {
    const directAlias = `_direct${days}`;
    const comboAlias = `_combos${days}`;
    const totalField = `_total${days}`;

    return {
      $addFields: {
        [totalField]: {
          $add: [
            { $ifNull: [{ $arrayElemAt: [`$${directAlias}.total`, 0] }, 0] },
            { $sum: `$${comboAlias}._contribution` },
          ],
        },
      },
    };
  },

  /**
   * Project totals into final sales30d / sales15d shape.
   */
  projectSalesFields(days30 = 30, days15 = 15): PipelineStage.AddFields {
    return {
      $addFields: {
        sales30d: {
          total: "$_total30",
          dailyAvg: {
            $cond: [
              { $gt: ["$_total30", 0] },
              { $divide: ["$_total30", days30] },
              0,
            ],
          },
        },
        sales15d: {
          total: "$_total15",
          dailyAvg: {
            $cond: [
              { $gt: ["$_total15", 0] },
              { $divide: ["$_total15", days15] },
              0,
            ],
          },
        },
      },
    };
  },
};
