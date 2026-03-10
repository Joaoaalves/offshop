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
      // 1. Chave de deduplicação: usa inventoryId quando disponível, senão sku
      {
        $addFields: {
          _dedupeKey: { $ifNull: ["$sku", "$inventoryId"] },
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
          _stockFull: { $first: "$stock.full" },
          _stockFlex: { $first: "$stock.flex" },
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
              $multiply: [
                { $ifNull: ["$_stockFull", 0] },
                "$_comboMultiplier",
              ],
            },
          },
          flexStock: {
            $sum: {
              $multiply: [
                { $ifNull: ["$_stockFlex", 0] },
                "$_comboMultiplier",
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
