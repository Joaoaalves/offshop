import { ProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";
import { SalesDashboardPipelineBuilder } from "./sales-dashboard.pipeline.builder";
import { MlSalesDashboard } from "@/models/mercado-livre/MlSalesDashboard";

export class SalesDashboardRepository {
  async rebuild() {
    const pipeline = new SalesDashboardPipelineBuilder()
      .joins()
      .project()
      .sort()
      .persist()
      .build();

    return ProductBaseCache.aggregate(pipeline, {
      allowDiskUse: true,
    });
  }

  async clear() {
    await MlSalesDashboard.deleteMany({});
  }
}
