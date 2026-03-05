import { PipelineStage } from "mongoose";
import { AbcCurve, Momentum, Trend } from "@/types/enums";
import { BaseStages } from "@/repositories/stock/stages/base.stages";

const DEFAULT_REGRESSION = {
  slope: 0,
  intercept: 0,
  r2: 0,
  slopePct: 0,
  avgRevenue: 0,
};

export const GroupBySkuStages = {
  /**
   * Stage 1: Agrupamento inicial por baseSku.
   * Coleta todos os produtos em um array e empilha os arrays de months para
   * serem achatados e re-agregados nas etapas seguintes.
   */
  initialGroup(): PipelineStage.Group {
    return {
      $group: {
        _id: "$baseSku",

        name: { $first: "$name" },
        image: { $first: "$image" },
        dateCreated: { $first: "$dateCreated" },

        // Analytics SKU-level (do produto dominante — primeiro da ordem)
        trend: { $first: "$_trend.trend" },
        momentum: { $first: "$_trend.momentum" },
        earlySignal: { $first: "$_trend.earlySignal" },
        regression: { $first: "$_trend.regression" },
        conversionDropped: { $first: "$_trend.conversionDropped" },
        conversionDropPct: { $first: "$_trend.conversionDropPct" },

        abcCurve: { $first: "$_abc.abcCurve" },
        abcCumulativePct: { $first: "$_abc.abcCumulativePct" },

        // Totais agregados
        totalUnits: { $sum: "$totals.units" },
        totalRevenue: { $sum: "$totals.revenue" },
        totalOrders: { $sum: "$totals.orders" },
        totalViews: { $sum: "$totals.views" },

        // Campos representativos do SKU
        _isNewCount: { $sum: { $cond: ["$isNew", 1, 0] } },
        _activeCount: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        _fulfillmentCount: { $sum: { $cond: [{ $eq: ["$logisticType", "fulfillment"] }, 1, 0] } },
        _firstStatus: { $first: "$status" },
        _firstLogisticType: { $first: "$logisticType" },
        availableQuantity: { $sum: "$availableQuantity" },

        // dailyAvg45 agregado
        _dailyAvg45Revenue: { $sum: "$dailyAvg45.revenue" },
        _dailyAvg45Units: { $sum: "$dailyAvg45.units" },
        _dailyAvg45ActiveDays: { $max: "$dailyAvg45.activeDays" },

        // Array de arrays de months (um por produto) — será achatado na próxima etapa
        _allMonths: { $push: "$months" },

        // Produtos individuais com analytics embutidos
        products: {
          $push: {
            productId: "$productId",
            sku: "$sku",
            name: "$name",
            image: "$image",
            link: "$link",
            price: "$price",
            status: "$status",
            logisticType: "$logisticType",
            catalogListing: "$catalogListing",
            itemRelation: "$itemRelation",
            availableQuantity: "$availableQuantity",
            isNew: "$isNew",
            months: "$months",
            totals: "$totals",
            dailyAvg45: "$dailyAvg45",
            dateCreated: "$dateCreated",
            trend: { $ifNull: ["$_trend.trend", Trend.INSUFICIENT] },
            momentum: { $ifNull: ["$_trend.momentum", Momentum.STABLE] },
            earlySignal: { $ifNull: ["$_trend.earlySignal", null] },
            regression: {
              $ifNull: ["$_trend.regression", DEFAULT_REGRESSION],
            },
            conversionDropped: {
              $ifNull: ["$_trend.conversionDropped", false],
            },
            conversionDropPct: {
              $ifNull: ["$_trend.conversionDropPct", 0],
            },
            abcCurve: { $ifNull: ["$_abc.abcCurve", AbcCurve.C] },
            abcCumulativePct: { $ifNull: ["$_abc.abcCumulativePct", 0] },
          },
        },
      },
    };
  },

  /**
   * Stage 2: Reestrutura totais, campos representativos e achata o array de
   * arrays de months em um único array plano.
   */
  flattenMonths(): PipelineStage.AddFields {
    return {
      $addFields: {
        totals: {
          units: "$totalUnits",
          revenue: "$totalRevenue",
          orders: "$totalOrders",
          views: "$totalViews",
        },
        isNew: { $gt: ["$_isNewCount", 0] },
        status: {
          $cond: [{ $gt: ["$_activeCount", 0] }, "active", "$_firstStatus"],
        },
        logisticType: {
          $cond: [
            { $gt: ["$_fulfillmentCount", 0] },
            "fulfillment",
            "$_firstLogisticType",
          ],
        },
        dailyAvg45: {
          revenue: "$_dailyAvg45Revenue",
          units: "$_dailyAvg45Units",
          activeDays: "$_dailyAvg45ActiveDays",
        },
        _flatMonths: {
          $reduce: {
            input: "$_allMonths",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    };
  },

  /**
   * Stage 3: Desfaz o array plano de months para re-agregar por mês.
   * preserveNullAndEmptyArrays garante que SKUs sem months permaneçam no pipeline.
   */
  unwindMonths(): PipelineStage.Unwind {
    return {
      $unwind: { path: "$_flatMonths", preserveNullAndEmptyArrays: true },
    };
  },

  /**
   * Stage 4: Agrupa por (baseSku, year, month) somando as métricas de cada mês.
   * Todos os campos SKU-level são preservados com $first.
   */
  groupByMonth(): PipelineStage.Group {
    return {
      $group: {
        _id: {
          sku: "$_id",
          year: "$_flatMonths.year",
          month: "$_flatMonths.month",
        },

        // Campos SKU-level preservados
        name: { $first: "$name" },
        image: { $first: "$image" },
        dateCreated: { $first: "$dateCreated" },
        trend: { $first: "$trend" },
        momentum: { $first: "$momentum" },
        earlySignal: { $first: "$earlySignal" },
        regression: { $first: "$regression" },
        conversionDropped: { $first: "$conversionDropped" },
        conversionDropPct: { $first: "$conversionDropPct" },
        abcCurve: { $first: "$abcCurve" },
        abcCumulativePct: { $first: "$abcCumulativePct" },
        totals: { $first: "$totals" },
        isNew: { $first: "$isNew" },
        status: { $first: "$status" },
        logisticType: { $first: "$logisticType" },
        availableQuantity: { $first: "$availableQuantity" },
        dailyAvg45: { $first: "$dailyAvg45" },
        products: { $first: "$products" },

        // Métricas do mês somadas entre produtos
        monthDate: { $first: "$_flatMonths.date" },
        totalItems: { $sum: "$_flatMonths.total.items" },
        totalRevenue: { $sum: "$_flatMonths.total.revenue" },
        totalOrders: { $sum: "$_flatMonths.total.orders" },
        fulfillmentItems: { $sum: "$_flatMonths.fulfillment.items" },
        fulfillmentRevenue: { $sum: "$_flatMonths.fulfillment.revenue" },
        fulfillmentOrders: { $sum: "$_flatMonths.fulfillment.orders" },
        flexItems: { $sum: "$_flatMonths.flex.items" },
        flexRevenue: { $sum: "$_flatMonths.flex.revenue" },
        flexOrders: { $sum: "$_flatMonths.flex.orders" },
        dropOffItems: { $sum: "$_flatMonths.dropOff.items" },
        dropOffRevenue: { $sum: "$_flatMonths.dropOff.revenue" },
        dropOffOrders: { $sum: "$_flatMonths.dropOff.orders" },
        views: { $sum: "$_flatMonths.views" },
      },
    };
  },

  /**
   * Stage 5: Re-agrupa por baseSku coletando o array de months já somados.
   * Entradas com year nulo (SKUs sem months) são descartadas via $$REMOVE.
   */
  collectMonths(): PipelineStage.Group {
    return {
      $group: {
        _id: "$_id.sku",

        name: { $first: "$name" },
        image: { $first: "$image" },
        dateCreated: { $first: "$dateCreated" },
        trend: { $first: "$trend" },
        momentum: { $first: "$momentum" },
        earlySignal: { $first: "$earlySignal" },
        regression: { $first: "$regression" },
        conversionDropped: { $first: "$conversionDropped" },
        conversionDropPct: { $first: "$conversionDropPct" },
        abcCurve: { $first: "$abcCurve" },
        abcCumulativePct: { $first: "$abcCumulativePct" },
        totals: { $first: "$totals" },
        isNew: { $first: "$isNew" },
        status: { $first: "$status" },
        logisticType: { $first: "$logisticType" },
        availableQuantity: { $first: "$availableQuantity" },
        dailyAvg45: { $first: "$dailyAvg45" },
        products: { $first: "$products" },

        months: {
          $push: {
            $cond: {
              if: { $ne: ["$_id.year", null] },
              then: {
                year: "$_id.year",
                month: "$_id.month",
                date: "$monthDate",
                views: "$views",
                conversionRate: 0,
                total: {
                  items: "$totalItems",
                  revenue: "$totalRevenue",
                  orders: "$totalOrders",
                },
                fulfillment: {
                  items: "$fulfillmentItems",
                  revenue: "$fulfillmentRevenue",
                  orders: "$fulfillmentOrders",
                },
                flex: {
                  items: "$flexItems",
                  revenue: "$flexRevenue",
                  orders: "$flexOrders",
                },
                dropOff: {
                  items: "$dropOffItems",
                  revenue: "$dropOffRevenue",
                  orders: "$dropOffOrders",
                },
              },
              else: "$$REMOVE",
            },
          },
        },
      },
    };
  },

  /**
   * Retorna todas as stages de agrupamento por SKU em ordem,
   * incluindo a extração do baseSku (mesma lógica do Stock).
   */
  build(): PipelineStage[] {
    return [
      ...BaseStages.addBaseSku(),
      this.initialGroup(),
      this.flattenMonths(),
      this.unwindMonths(),
      this.groupByMonth(),
      this.collectMonths(),
      // Expõe sku como campo para joins e merge subsequentes
      { $addFields: { sku: "$_id" } },
    ];
  },
};
