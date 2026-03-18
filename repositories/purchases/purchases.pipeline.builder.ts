import { PipelineStage } from "mongoose";
import { SalesStages } from "./stages/sales.stages";
import { StockMapStage } from "./stages/stock.stage";
import { TrendStage } from "./stages/trend.stage";
import { RestockStage } from "./stages/restock.stage";
import { MergeStage, ProjectStage } from "./stages/merge.stage";
import { SupplierStage } from "./stages/supplier.stage";

export class PurchasesPipelineBuilder {
  private stages: PipelineStage[] = [];

  /** Filter to simples InternalProducts only */
  matchSimples() {
    this.stages.push({ $match: { productType: "simples" } });
    return this;
  }

  /**
   * Lookup sales for the last 30 and 15 days.
   *
   * For each product, three sources of sales are considered:
   *  1. Direct simples sales (sku === baseSku)
   *  2. Kit sales (sku matches ^{\d+}U-baseSku$ or ^KIT-baseSku$), with numeric multiplier
   *  3. Combo contributions (combos that contain this product as a component)
   */
  withSales(days30 = 30, days15 = 15) {
    this.stages.push(
      // ── 30-day window ──────────────────────────────────────────────────────
      SalesStages.lookupDirectAndKit(days30, "_direct30"),
      SalesStages.lookupComboContributions(days30, "_combos30"),
      SalesStages.computeMetrics(days30),

      // ── 15-day window ──────────────────────────────────────────────────────
      SalesStages.lookupDirectAndKit(days15, "_direct15"),
      SalesStages.lookupComboContributions(days15, "_combos15"),
      SalesStages.computeMetrics(days15),

      // ── Final metrics fields ───────────────────────────────────────────────
      SalesStages.projectSalesFields(days30, days15),
    );
    return this;
  }

  /** Join Supplier to get supplierName and supplierLeadTimeDays */
  withSupplier() {
    this.stages.push(...SupplierStage.lookup());
    return this;
  }

  /** Map SelfProduct.stock (storage, incoming, fulfillment) into dashboard shape */
  withStock() {
    this.stages.push(StockMapStage.map());
    return this;
  }

  /** Classify trend from 15d vs 30d daily average comparison */
  withTrend() {
    this.stages.push(TrendStage.compute());
    return this;
  }

  /** Compute restock suggestion based on minStockDays and current stock */
  withRestock() {
    this.stages.push(RestockStage.compute());
    return this;
  }

  /** Project to final shape and merge into purchasedashboards collection */
  persist() {
    this.stages.push(ProjectStage.final(), MergeStage.persist());
    return this;
  }

  build(): PipelineStage[] {
    return this.stages;
  }
}
