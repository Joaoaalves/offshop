import { PipelineStage } from "mongoose";

/**
 * Projects the final document shape, stripping all pipeline-internal fields (_*).
 */
export const ProjectStage = {
  final(): PipelineStage.Project {
    return {
      $project: {
        _id: 0,
        baseSku: 1,
        name: 1,
        manufacturerCode: 1,
        supplierName: 1,
        supplierLeadTimeDays: 1,
        supplierSafetyDays: 1,
        cost: 1,
        unitsPerBox: 1,
        minStockDays: 1,
        sales30d: 1,
        sales15d: 1,
        trend: 1,
        stock: 1,
        restock: 1,
        // Editable fields are NOT projected here — they live only in the
        // existing DB document and are preserved by the merge whenMatched pipeline.
      },
    };
  },
};

/**
 * Merges into purchasedashboards collection on baseSku.
 *
 * When a document already exists, computed fields are replaced while the three
 * manually editable fields (classification, order, newCost) are preserved.
 */
export const MergeStage = {
  persist(): PipelineStage.Merge {
    return {
      $merge: {
        into: "purchasedashboards",
        on: "baseSku",
        whenMatched: [
          {
            $replaceWith: {
              $mergeObjects: [
                // New computed data takes precedence for all non-editable fields
                "$$new",
                // Preserve editable fields from the existing document if set
                {
                  classification: {
                    $cond: {
                      if: { $gt: ["$$ROOT.classification", null] },
                      then: "$$ROOT.classification",
                      else: "$$REMOVE",
                    },
                  },
                  order: {
                    $cond: {
                      if: { $gt: ["$$ROOT.order", null] },
                      then: "$$ROOT.order",
                      else: "$$REMOVE",
                    },
                  },
                  newCost: {
                    $cond: {
                      if: { $gt: ["$$ROOT.newCost", null] },
                      then: "$$ROOT.newCost",
                      else: "$$REMOVE",
                    },
                  },
                },
              ],
            },
          },
        ],
        whenNotMatched: "insert",
      },
    };
  },
};
