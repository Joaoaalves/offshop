import { PipelineStage } from "mongoose";

export const ConsolidateStages = {
  project(): PipelineStage.Project {
    return {
      $project: {
        _id: 0,
        baseSku: "$_id",

        months: {
          $map: {
            input: "$months",
            as: "m",
            in: {
              year: { $year: "$$m._id" },
              month: { $month: "$$m._id" },
              total: {
                items: "$$m.totalItems",
                revenue: "$$m.totalRevenue",
                orders: "$$m.totalOrders",
              },
              fulfillment: {
                items: "$$m.fulfillmentItems",
                revenue: "$$m.fulfillmentRevenue",
                orders: "$$m.fulfillmentOrders",
              },
              flex: {
                items: "$$m.flexItems",
                revenue: "$$m.flexRevenue",
                orders: "$$m.flexOrders",
              },
              dropOff: {
                items: "$$m.dropOffItems",
                revenue: "$$m.dropOffRevenue",
                orders: "$$m.dropOffOrders",
              },
            },
          },
        },

        fulfillment: {
          stock: "$fullStock",
          replenishment: {
            coverageDays: "$fullCoverageDays",
            days: "$fullReplenishmentDays",
            suggestedUnits: "$fullsuggestedUnits",
          },
        },

        flex: {
          stock: "$flexStock",
          replenishment: {
            coverageDays: "$flexCoverageDays",
            days: "$flexReplenishmentDays",
            suggestedUnits: "$flexsuggestedUnits",
          },
        },

        avgDailySales: 1,

        distribution: {
          fulfillment: "$fullOrdersRatio",
          flex: "$flexOrdersRatio",
          dropOff: {
            $subtract: [1, { $add: ["$fullOrdersRatio", "$flexOrdersRatio"] }],
          },
        },

        supplier: {
          _id: "$supplier._id",
          name: "$supplier.name",
        },

        rebuiltAt: "$$NOW",
      },
    };
  },

  merge(): PipelineStage.Merge {
    return {
      $merge: {
        into: "stockcaches",
        on: "baseSku",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    };
  },
};
