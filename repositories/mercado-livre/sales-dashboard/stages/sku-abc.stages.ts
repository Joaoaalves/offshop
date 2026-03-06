import { PipelineStage } from "mongoose";
import { AbcCurve } from "@/types/enums";

/**
 * Calcula a curva ABC no nível de SKU, usando a receita agregada de cada SKU.
 * Replica a lógica exata de product-abc (WindowStages + CurveStages):
 *   A ≤ 80%  |  B ≤ 95%  |  C = resto
 */
export const SkuAbcStages = {
  build(): PipelineStage[] {
    return [
      // 1. Receita cumulativa e total geral, ordenados por receita desc
      {
        $setWindowFields: {
          sortBy: { "totals.revenue": -1 },
          output: {
            _skuCumulativeRevenue: {
              $sum: "$totals.revenue",
              window: { documents: ["unbounded", "current"] },
            },
            _skuGrandTotalRevenue: {
              $sum: "$totals.revenue",
              window: { documents: ["unbounded", "unbounded"] },
            },
          },
        },
      } as PipelineStage,

      // 2. Percentual cumulativo (escala 0–100, igual ao product-abc)
      {
        $addFields: {
          abcCumulativePct: {
            $cond: [
              { $gt: ["$_skuGrandTotalRevenue", 0] },
              {
                $multiply: [
                  { $divide: ["$_skuCumulativeRevenue", "$_skuGrandTotalRevenue"] },
                  100,
                ],
              },
              100,
            ],
          },
        },
      },

      // 3. Classificação com os mesmos thresholds do CurveStages.classify()
      {
        $addFields: {
          abcCurve: {
            $switch: {
              branches: [
                { case: { $lte: ["$abcCumulativePct", 80] }, then: AbcCurve.A },
                { case: { $lte: ["$abcCumulativePct", 95] }, then: AbcCurve.B },
              ],
              default: AbcCurve.C,
            },
          },
        },
      },
    ];
  },
};
