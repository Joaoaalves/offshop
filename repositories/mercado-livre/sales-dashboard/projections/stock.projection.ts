export const StockProjection = {
  fields() {
    return {
      stock: {
        $cond: {
          if: { $gt: ["$_stock", null] },
          then: {
            // Fulfillment FBA
            fulfillment: {
              stock: { $ifNull: ["$_stock.fulfillment.stock", 0] },
              replenishment: {
                coverageDays: {
                  $ifNull: [
                    "$_stock.fulfillment.replenishment.coverageDays",
                    0,
                  ],
                },
                replenishmentDays: {
                  $ifNull: [
                    "$_stock.fulfillment.replenishment.replenishmentDays",
                    0,
                  ],
                },
                suggestedReplenishmentUnits: {
                  $ifNull: [
                    "$_stock.fulfillment.replenishment.suggestedReplenishmentUnits",
                    0,
                  ],
                },
              },
            },

            // Flex (Marketplace)
            flex: {
              stock: { $ifNull: ["$_stock.flex.stock", 0] },
              replenishment: {
                coverageDays: {
                  $ifNull: ["$_stock.flex.replenishment.coverageDays", 0],
                },
                replenishmentDays: {
                  $ifNull: ["$_stock.flex.replenishment.replenishmentDays", 0],
                },
                suggestedReplenishmentUnits: {
                  $ifNull: [
                    "$_stock.flex.replenishment.suggestedReplenishmentUnits",
                    0,
                  ],
                },
              },
            },

            // Métricas gerais
            avgDailySales: { $ifNull: ["$_stock.avgDailySales", 0] },

            // Distribuição de vendas por modalidade
            distribution: {
              fulfillment: {
                $ifNull: ["$_stock.distribution.fulfillment", 0],
              },
              flex: { $ifNull: ["$_stock.distribution.flex", 0] },
              dropOff: { $ifNull: ["$_stock.distribution.dropOff", 0] },
            },

            // Fornecedor
            supplier: { $ifNull: ["$_stock.supplier", null] },

            // Histórico de vendas (opcional, para análise)
            months: { $ifNull: ["$_stock.months", []] },
          },
          else: null,
        },
      },
    };
  },
};
