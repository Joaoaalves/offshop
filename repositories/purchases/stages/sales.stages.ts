import { PipelineStage } from "mongoose";

/**
 * Extracts the numeric multiplier from a salesbuckets sku.
 *
 * Examples:
 *   "5U-SKU123"    → 5
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
 * Matches (contains match — avoids $concat regex issues inside $lookup):
 *  - Direct simples sales:  sku contains baseSku
 *  - Kit sales:             sku matches {N}U-baseSku (multiplier applied)
 *
 * NOTE: uses substring match identical to {$regex: baseSku} in a regular query.
 */
export const SalesStages = {
  lookupDirectAndKit(days: number, alias: string): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "sales",
        let: { baseSku: "$baseSku" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Contains match — same behaviour as {$regex: baseSku}
                  { $regexMatch: { input: "$sku", regex: "$$baseSku" } },
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
   * Lookup combos that contain this simples product as a component, then sum
   * how many units of this product were sold through them.
   *
   * Combos are identified by component relationship (components[].product === _id),
   * NOT by SKU prefix — we cannot guarantee SKU format for combos.
   *
   * For each combo found:
   *   contribution = combo_items_sold × quantity_of_this_product_in_combo
   */
  lookupComboContributions(days: number, alias: string): PipelineStage.Lookup {
    return {
      $lookup: {
        from: "internalproducts",
        let: { pid: "$_id" },
        pipeline: [
          // 1 — Find combos that contain this product as a component
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

          // 3 — Lookup this combo's sales by contains match on its baseSku
          {
            $lookup: {
              from: "sales",
              let: { comboSku: "$baseSku", qty: "$_qty" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $regexMatch: { input: "$sku", regex: "$$comboSku" } },
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
