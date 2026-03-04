import mongoose from "mongoose";
import { MlProductBaseCacheRepository } from "./product-base/product-base.repository";
import { MlProductTrendRepository } from "./product-trend/product-trend.repository";
import { MlProductAbcCacheRepository } from "./product-abc/product-abc.repository";
import { MlSalesDashboardRepository } from "./sales-dashboard/sales-dashboard.repository";
import { StockRepository } from "../stock/stock.repository";

export class SalesRebuildOrchestrator {
  constructor(
    private readonly base = new MlProductBaseCacheRepository(),
    private readonly trend = new MlProductTrendRepository(),
    private readonly abc = new MlProductAbcCacheRepository(),
    private readonly dash = new MlSalesDashboardRepository(),
    private readonly stock = new StockRepository(),
  ) {}

  async rebuildAll() {
    await this.base.rebuild();
    console.log("Base built");

    await this.abc.rebuild();
    console.log("Abc built");

    await this.trend.rebuild();
    console.log("Trend built");

    await this.stock.rebuild();
    console.log("Stock built");

    await this.dash.rebuild();
    console.log("Dash built");
  }

  async rebuildFromTrend() {
    await this.trend.rebuild();

    await this.abc.rebuild();

    await this.dash.rebuild();
  }

  async rebuildFromAbc() {
    await this.abc.rebuild();

    await this.dash.rebuild();
  }

  async clearAll() {
    await Promise.all([
      this.base.clear(),
      this.trend.clear(),
      this.abc.clear(),
      this.dash.clear(),
    ]);
  }
}
