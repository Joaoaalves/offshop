import { PipelineStage } from "mongoose";

export const BaseStages = {
  matchValidProducts(): PipelineStage.Match {
    return {
      $match: {
        sku: { $exists: true, $ne: null },
        productId: { $exists: true, $ne: null },
      },
    };
  },

  addBaseSku(): PipelineStage[] {
    return [
      {
        $addFields: {
          _isCombo: {
            $regexMatch: { input: "$sku", regex: /^([0-9]+U|KIT|COMBO)-/ },
          },
        },
      },
      {
        $addFields: {
          baseSku: {
            $cond: [
              "$_isCombo",
              {
                $substrCP: [
                  "$sku",
                  { $add: [{ $indexOfCP: ["$sku", "-"] }, 1] },
                  { $strLenCP: "$sku" },
                ],
              },
              "$sku",
            ],
          },
          _comboMultiplier: {
            $cond: [
              "$_isCombo",
              {
                $let: {
                  vars: {
                    m: {
                      $regexFind: { input: "$sku", regex: /^([0-9]+)U-/ },
                    },
                  },
                  in: {
                    $cond: [
                      { $ne: ["$$m", null] },
                      { $toInt: { $arrayElemAt: ["$$m.captures", 0] } },
                      1,
                    ],
                  },
                },
              },
              1,
            ],
          },
        },
      },
    ];
  },

  groupByBaseSku(): PipelineStage[] {
    return [
      // 1. Chave de deduplicação: usa inventoryId quando disponível, senão productId
      {
        $addFields: {
          _dedupeKey: { $ifNull: ["$inventoryId", "$productId"] },
        },
      },

      // 2. Deduplica inventários compartilhados — mantém todos os productIds do grupo
      {
        $group: {
          _id: {
            baseSku: "$baseSku",
            dedupeKey: "$_dedupeKey",
            logisticType: "$logisticType",
          },
          _mlbIds: { $addToSet: "$productId" },
          baseSku: { $first: "$baseSku" },
          logisticType: { $first: "$logisticType" },
          availableQuantity: { $first: "$availableQuantity" },
          _comboMultiplier: { $first: "$_comboMultiplier" },
        },
      },

      // 3. Agrupa por baseSku somando o estoque já deduplicado
      {
        $group: {
          _id: "$baseSku",
          _mlbIdGroups: { $push: "$_mlbIds" },
          fullStock: {
            $sum: {
              $cond: [
                { $eq: ["$logisticType", "fulfillment"] },
                {
                  $multiply: [
                    { $ifNull: ["$availableQuantity", 0] },
                    "$_comboMultiplier",
                  ],
                },
                0,
              ],
            },
          },
          flexStock: {
            $sum: {
              $cond: [
                { $eq: ["$logisticType", "xd_drop_off"] },
                {
                  $multiply: [
                    { $ifNull: ["$availableQuantity", 0] },
                    "$_comboMultiplier",
                  ],
                },
                0,
              ],
            },
          },
        },
      },

      // 4. Achata os grupos de mlbIds em um único conjunto
      {
        $addFields: {
          mlbIds: {
            $reduce: {
              input: "$_mlbIdGroups",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ];
  },
};
