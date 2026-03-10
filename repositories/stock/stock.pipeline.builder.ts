import { PipelineStage } from "mongoose";
import { SalesStages } from "./stages/sales.stages";
import { MetricsStages } from "./stages/metrics.stages";
import { StockStages } from "./stages/stock.stages";
import { SupplierStages } from "./stages/supplier.stages";
import { ConsolidateStages } from "./stages/consolidate.stages";
import { BaseStages } from "./stages/base.stages";

export class StockPipelineBuilder {
  private stages: PipelineStage[] = [];

  base() {
    this.stages.push(
      BaseStages.matchValidProducts(), // Only valid SKU
      ...BaseStages.addBaseSku(), // Calculate baseSku
      ...BaseStages.groupByBaseSku(), // Group using baseSKU (with inventory dedup)
    );

    return this;
  }

  withSales(windowDays: number) {
    this.stages.push(
      SalesStages.lookupLastDays(windowDays), // Lookup last n days sales
      SalesStages.addLastDays(), // Last n days totals
      SalesStages.totals(windowDays), // Daily avg of last n days + total orders
    );

    return this;
  }

  withMetrics(marketPlaceDelay: number, extraBufferDays: number) {
    this.stages.push(
      MetricsStages.ratios(marketPlaceDelay, extraBufferDays), // Ratios for each logistic type
      MetricsStages.dailyDemand(), // Daily demand for each logistic type
    );

    return this;
  }

  withStock() {
    this.stages.push(
      StockStages.coverage(), // Coverage for each logistic type
      StockStages.replenishment(), // Replenishment for each logistic type
    );

    return this;
  }

  withSupplier() {
    this.stages.push(...SupplierStages.lookup()); // Lookup to Self Product and Supplier info

    return this;
  }

  persist() {
    this.stages.push(
      ConsolidateStages.project(), // Project all needed info
      ConsolidateStages.merge(), // Merge into dashboard table
    );

    return this;
  }

  build() {
    return this.stages;
  }
}
