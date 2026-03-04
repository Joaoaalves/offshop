import { MlProduct } from "@/models/mercado-livre/MlProduct";
import { ProductBasePipelineBuilder } from "./product-base.pipeline.builder";
import { MlProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";

export class MlProductBaseCacheRepository {
  private buildTimeWindow() {
    const now = new Date();
    const startMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 4, 1),
    );
    const nextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    return { startMonth, nextMonth };
  }

  async rebuild() {
    const { startMonth, nextMonth } = this.buildTimeWindow();

    const pipeline = new ProductBasePipelineBuilder()
      .base()
      .withViews(startMonth, nextMonth)
      .withMonthlySales(startMonth, nextMonth)
      .buildMonths()
      .withTotals()
      .persist()
      .build();

    return MlProduct.aggregate(pipeline, { allowDiskUse: true });
  }

  async clear() {
    await MlProductBaseCache.deleteMany({});
  }
}
