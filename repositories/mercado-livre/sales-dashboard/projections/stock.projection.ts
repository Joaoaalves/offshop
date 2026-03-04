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
                coverage: {
                  $ifNull: ["$_stock.fulfillment.replenishment.coverage", 0],
                },
                days: {
                  $ifNull: ["$_stock.fulfillment.replenishment.days", 0],
                },
                suggestedUnits: {
                  $ifNull: [
                    "$_stock.fulfillment.replenishment.suggestedUnits",
                    0,
                  ],
                },
              },
            },

            // Flex (Marketplace)
            flex: {
              stock: { $ifNull: ["$_stock.flex.stock", 0] },
              replenishment: {
                coverage: {
                  $ifNull: ["$_stock.flex.replenishment.coverage", 0],
                },
                days: {
                  $ifNull: ["$_stock.flex.replenishment.days", 0],
                },
                suggestedUnits: {
                  $ifNull: ["$_stock.flex.replenishment.suggestedUnits", 0],
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
