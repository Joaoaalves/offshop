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
        },
      },
    ];
  },

  groupByBaseSku(): PipelineStage.Group {
    return {
      $group: {
        _id: "$baseSku",
        mlbIds: { $addToSet: "$productId" },
        fullStock: {
          $sum: {
            $cond: [
              { $eq: ["$logisticType", "fulfillment"] },
              {
                $multiply: [
                  { $ifNull: ["$availableQuantity", 0] },
                  { $ifNull: ["$unitsPerPack", 1] },
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
                  { $ifNull: ["$unitsPerPack", 1] },
                ],
              },
              0,
            ],
          },
        },
      },
    };
  },
};
