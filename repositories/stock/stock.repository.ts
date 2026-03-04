import { MlProduct } from "@/models/mercado-livre/MlProduct";
import { StockPipelineBuilder } from "./stock.pipeline.builder";
import { Stock } from "@/models/Stock";

const MARKETPLACE_DELAY_DAYS = 2;
const EXTRA_BUFFER_DAYS = 5;
const SALES_WINDOW_DAYS = 45;

export class StockRepository {
  async rebuild() {
    const pipeline = new StockPipelineBuilder()
      .base()
      .withSales(SALES_WINDOW_DAYS)
      .withMetrics(MARKETPLACE_DELAY_DAYS, EXTRA_BUFFER_DAYS)
      .withSupplier()
      .withStock()
      .persist()
      .build();

    await MlProduct.aggregate(pipeline, { allowDiskUse: true });
  }

  async clearStockCache() {
    await Stock.deleteMany({});
  }

  async getLowCoverage() {
    return Stock.find({
      $or: [
        {
          "fulfillment.replenishment.coverage": { $lte: 45 },
          avgDailySales: { $gt: 0.05 },
        },
      ],
    })
      .sort({ "fulfillment.replenishment.coverage": 1 })
      .lean();
  }

  async discontinue() {
    return Stock.find({ avgDailySales: { $lte: 0.1 } }).lean();
  }

  async getDashboard() {
    return Stock.find({}).lean();
  }
}
